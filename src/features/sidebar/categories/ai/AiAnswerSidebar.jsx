import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./AiAnswerSidebar.css";
import SidebarHeader from "../../SidebarHeader";
import AppInput from "../../../../shared/ui/atoms/AppInput";
import useDebouncedCallback from "../../../../shared/hooks/useDebouncedCallback";
import {
  InfoIcon,
  ExternalLinkIcon,
  ChevronIcon,
  CheckIcon,
  TrashIcon,
} from "../../../../shared/ui/atoms/icons";

/* ───────────────── Reusable SelectDropdown ─────────────────── */
function SelectDropdown({ label, options, value, multiSelect, placeholder, onSelect, onCreate, createLabel, onEdit, error, showInfo }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedValues = multiSelect ? (value ?? []) : value ? [value] : [];
  const isSelected = (id) => selectedValues.includes(id);
  const triggerText = multiSelect
    ? selectedValues.length === 0 ? placeholder : `${selectedValues.length} function${selectedValues.length > 1 ? "s" : ""} selected`
    : (options.find((o) => o.id === value)?.name ?? placeholder);
  const hasValue = multiSelect ? selectedValues.length > 0 : Boolean(value);

  const handleItemClick = (id) => {
    if (multiSelect) {
      onSelect(isSelected(id) ? selectedValues.filter((v) => v !== id) : [...selectedValues, id]);
    } else {
      onSelect(id);
      setOpen(false);
    }
  };

  return (
    <div className="ai-field" ref={wrapRef}>
      <div className="ai-field__label-row">
        <span className="ai-field__label">{label}</span>
        {showInfo && <span className="ai-field__info-icon"><InfoIcon /></span>}
      </div>

      <button type="button"
        className={`ai-select__trigger${error ? " ai-select__trigger--error" : ""}${open ? " ai-select__trigger--open" : ""}`}
        onClick={() => setOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={open}>
        <span className={hasValue ? "ai-select__value" : "ai-select__placeholder"}>{triggerText}</span>
        <span className={`ai-select__chevron${open ? " ai-select__chevron--up" : ""}`}><ChevronIcon /></span>
      </button>

      {error && <p className="ai-field__error">{error}</p>}

      {open && (
        <div className="ai-select__dropdown" role="listbox">
          {options.length === 0
            ? <div className="ai-select__empty">No options yet</div>
            : options.map((opt) => (
              <div key={opt.id} className={`ai-select__option-row${isSelected(opt.id) ? " ai-select__option-row--selected" : ""}`}>
                <button type="button" role="option" aria-selected={isSelected(opt.id)}
                  className="ai-select__option" onClick={() => handleItemClick(opt.id)}>
                  <span className="ai-select__check">{isSelected(opt.id) && <CheckIcon />}</span>
                  <span className="ai-select__opt-name">{opt.name}</span>
                </button>
                {onEdit && (
                  <button type="button" className="ai-select__edit-btn" title="Edit"
                    onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(opt); }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                )}
              </div>
            ))
          }
          {onCreate && (
            <>
              <div className="ai-select__divider"/>
              <button type="button" className="ai-select__create" onClick={() => { onCreate(); setOpen(false); }}>
                <span className="ai-select__create-plus">+</span>{createLabel}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
SelectDropdown.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  multiSelect: PropTypes.bool,
  placeholder: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
  onEdit: PropTypes.func,
  createLabel: PropTypes.string,
  error: PropTypes.string,
  showInfo: PropTypes.bool,
};
SelectDropdown.defaultProps = { multiSelect: false, placeholder: "Select\u2026", createLabel: "Create", error: null, showInfo: false };

/* ─────────────────── Function detail layer ─────────────────── */
const DEFAULT_FN_SNIPPET = `// Function receives user message and context
// Return a value to pass to the AI as context
async function handler(message, context) {
  // Your logic here
  return { result: "" };
}`;

function FunctionLayer({ fn, onSave, onDelete }) {
  const [name, setName] = useState(fn?.name ?? "");
  const [code, setCode] = useState(fn?.code ?? DEFAULT_FN_SNIPPET);

  useEffect(() => {
    setName(fn?.name ?? "");
    setCode(fn?.code ?? DEFAULT_FN_SNIPPET);
  }, [fn?.id]);

  const isDirty = name !== (fn?.name ?? "") || code !== (fn?.code ?? DEFAULT_FN_SNIPPET);

  return (
    <div className="ai-layer">
      <div className="ai-field">
        <label className="ai-field__label" htmlFor="fn-name">Function name</label>
        <AppInput id="fn-name" className="node-sidebar__input" value={name}
          onChange={(e) => setName(e.target.value)} placeholder="e.g. fetchWeather" />
      </div>

      <div className="ai-field">
        <div className="ai-field__label-row">
          <span className="ai-field__label">JavaScript snippet</span>
          <span className="ai-field__badge ai-field__badge--js">JS</span>
        </div>
        <textarea className="ai-field__textarea ai-field__textarea--code"
          value={code} onChange={(e) => setCode(e.target.value)}
          spellCheck={false} autoComplete="off" autoCorrect="off" />
      </div>

      <div className="ai-layer__actions">
        <button type="button" className="ai-layer__btn ai-layer__btn--danger"
          onClick={() => onDelete(fn.id)}>
          <TrashIcon /> Delete
        </button>
        <button type="button" className={`ai-layer__btn ai-layer__btn--primary${isDirty ? " ai-layer__btn--active" : ""}`}
          onClick={() => onSave({ ...fn, name: name.trim() || "Untitled", code })}
          disabled={!isDirty}>
          Save
        </button>
      </div>
    </div>
  );
}
FunctionLayer.propTypes = { fn: PropTypes.object, onSave: PropTypes.func.isRequired, onDelete: PropTypes.func.isRequired };

/* ──────────────────── KB detail layer ──────────────────────── */
const KB_MODELS = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-4o-mini", name: "GPT-4o mini" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
];

function KbLayer({ kb, onSave, onDelete }) {
  const [name, setName] = useState(kb?.name ?? "");
  const [model, setModel] = useState(kb?.model ?? "gpt-4o");

  useEffect(() => {
    setName(kb?.name ?? "");
    setModel(kb?.model ?? "gpt-4o");
  }, [kb?.id]);

  const isDirty = name !== (kb?.name ?? "") || model !== (kb?.model ?? "gpt-4o");

  return (
    <div className="ai-layer">
      <div className="ai-field">
        <label className="ai-field__label" htmlFor="kb-name">Knowledge base name</label>
        <AppInput id="kb-name" className="node-sidebar__input" value={name}
          onChange={(e) => setName(e.target.value)} placeholder="e.g. Product Docs" />
      </div>

      <div className="ai-field">
        <label className="ai-field__label">Model</label>
        <div className="ai-model-grid">
          {KB_MODELS.map((m) => (
            <button key={m.id} type="button"
              className={`ai-model-option${model === m.id ? " ai-model-option--selected" : ""}`}
              onClick={() => setModel(m.id)}>
              {model === m.id && <span className="ai-model-option__check"><CheckIcon /></span>}
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-layer__actions">
        <button type="button" className="ai-layer__btn ai-layer__btn--danger"
          onClick={() => onDelete(kb.id)}>
          <TrashIcon /> Delete
        </button>
        <button type="button" className={`ai-layer__btn ai-layer__btn--primary${isDirty ? " ai-layer__btn--active" : ""}`}
          onClick={() => onSave({ ...kb, name: name.trim() || "Untitled", model })}
          disabled={!isDirty}>
          Save
        </button>
      </div>
    </div>
  );
}
KbLayer.propTypes = { kb: PropTypes.object, onSave: PropTypes.func.isRequired, onDelete: PropTypes.func.isRequired };

/* ─────────────────── Main sidebar ──────────────────────────── */
const DEFAULT_PROMPT = 'You are a smart assistant.  You will try to answer the questions from the context information provided to you. Always try to provide responses in a HTML format. If not possible, provide response in plain text. If you do not have the answer to the question asked, respond with "Sorry, I do not know the answer to this. Can you try asking something else?"';

// layer shape: { type: "fn" | "kb", id: string | null }
export default function AiAnswerSidebar({ selectedNode, updateNode, onClose }) {
  const nodeData = selectedNode?.data ?? {};

  const [question, setQuestion] = useState(nodeData.question ?? "");
  const [prompt, setPrompt] = useState(nodeData.prompt ?? DEFAULT_PROMPT);
  // null = root layer, otherwise { type, id }
  const [activeLayer, setActiveLayer] = useState(null);

  const { debounced: debouncedUpdate } = useDebouncedCallback(updateNode, 200);

  useEffect(() => {
    setQuestion(nodeData.question ?? "");
    setPrompt(nodeData.prompt ?? DEFAULT_PROMPT);
    setActiveLayer(null);
  }, [selectedNode?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const knowledgeBases = nodeData.knowledgeBases ?? [];
  const knowledgeBaseId = nodeData.knowledgeBaseId ?? null;
  const availableFunctions = nodeData.availableFunctions ?? [];
  const functionIds = nodeData.functionIds ?? [];

  /* ── Root-layer handlers ── */
  const handleQuestionChange = (e) => { setQuestion(e.target.value); debouncedUpdate({ question: e.target.value }); };
  const handlePromptChange   = (e) => { setPrompt(e.target.value);   debouncedUpdate({ prompt: e.target.value }); };
  const handleKbSelect       = (id) => updateNode({ knowledgeBaseId: id });
  const handleFunctionSelect = (ids) => updateNode({ functionIds: ids });

  /* ── Create — open blank detail layer ── */
  const handleCreateKb = useCallback(() => {
    const id = `kb_${Date.now()}`;
    updateNode({ knowledgeBases: [...knowledgeBases, { id, name: "Untitled", model: "gpt-4o" }] });
    setActiveLayer({ type: "kb", id });
  }, [knowledgeBases, updateNode]);

  const handleCreateFunction = useCallback(() => {
    const id = `fn_${Date.now()}`;
    updateNode({ availableFunctions: [...availableFunctions, { id, name: "Untitled", code: DEFAULT_FN_SNIPPET }] });
    setActiveLayer({ type: "fn", id });
  }, [availableFunctions, updateNode]);

  /* ── Edit — open existing item in detail layer ── */
  const handleEditKb = useCallback((kb) => setActiveLayer({ type: "kb", id: kb.id }), []);
  const handleEditFn = useCallback((fn) => setActiveLayer({ type: "fn", id: fn.id }), []);

  /* ── Save from detail layer ── */
  const handleSaveKb = useCallback((updated) => {
    updateNode({ knowledgeBases: knowledgeBases.map((k) => k.id === updated.id ? updated : k) });
    setActiveLayer(null);
  }, [knowledgeBases, updateNode]);

  const handleSaveFn = useCallback((updated) => {
    updateNode({ availableFunctions: availableFunctions.map((f) => f.id === updated.id ? updated : f) });
    setActiveLayer(null);
  }, [availableFunctions, updateNode]);

  /* ── Delete from detail layer ── */
  const handleDeleteKb = useCallback((id) => {
    updateNode({
      knowledgeBases: knowledgeBases.filter((k) => k.id !== id),
      knowledgeBaseId: knowledgeBaseId === id ? null : knowledgeBaseId,
    });
    setActiveLayer(null);
  }, [knowledgeBases, knowledgeBaseId, updateNode]);

  const handleDeleteFn = useCallback((id) => {
    updateNode({
      availableFunctions: availableFunctions.filter((f) => f.id !== id),
      functionIds: functionIds.filter((fid) => fid !== id),
    });
    setActiveLayer(null);
  }, [availableFunctions, functionIds, updateNode]);

  /* ── Derived: active item ── */
  const activeKb = activeLayer?.type === "kb" ? knowledgeBases.find((k) => k.id === activeLayer.id) ?? null : null;
  const activeFn = activeLayer?.type === "fn" ? availableFunctions.find((f) => f.id === activeLayer.id) ?? null : null;
  const layerIndex = activeLayer ? 1 : 0;

  if (!selectedNode) return null;

  return (
    <aside className="node-sidebar">
      <SidebarHeader
        onClose={onClose}
        layerIndex={layerIndex}
        setLayerStack={() => setActiveLayer(null)}
      />

      <div className="node-sidebar__body">
        {/* ──────────────── Root layer ──────────────── */}
        {layerIndex === 0 && (
          <>
            {/* Question */}
            <div className="ai-field">
              <label className="ai-field__label" htmlFor="ai-question">Question</label>
              <textarea id="ai-question" className="ai-field__textarea"
                value={question} onChange={handleQuestionChange}
                placeholder="How can I help you?" />
              <p className="ai-field__hint">
                You can reference a <span className="ai-field__hint-link">variable</span> by typing #
              </p>
            </div>

            {/* Knowledge base */}
            <SelectDropdown
              label="Knowledge base"
              options={knowledgeBases}
              value={knowledgeBaseId}
              placeholder="Select KB"
              onSelect={handleKbSelect}
              onCreate={handleCreateKb}
              onEdit={handleEditKb}
              createLabel="Create Knowledge Base"
            />

            {/* Prompt */}
            <div className="ai-field">
              <div className="ai-field__label-row">
                <span className="ai-field__label">Prompt</span>
                <span className="ai-field__info-icon"><InfoIcon /></span>
                <button type="button" className="ai-field__external-btn" aria-label="Open prompt editor">
                  <ExternalLinkIcon />
                </button>
              </div>
              <textarea className="ai-field__textarea ai-field__textarea--tall"
                value={prompt} onChange={handlePromptChange}
                placeholder="Enter your prompt\u2026" />
            </div>

            {/* Execute functions */}
            <SelectDropdown
              label="Execute function(s)"
              showInfo
              options={availableFunctions}
              value={functionIds}
              multiSelect
              placeholder="Select functions"
              onSelect={handleFunctionSelect}
              onCreate={handleCreateFunction}
              onEdit={handleEditFn}
              createLabel="Create Function"
            />
          </>
        )}

        {/* ──────────────── Function detail layer ──────────────── */}
        {layerIndex === 1 && activeLayer?.type === "fn" && (
          <FunctionLayer fn={activeFn} onSave={handleSaveFn} onDelete={handleDeleteFn} />
        )}

        {/* ──────────────── KB detail layer ──────────────── */}
        {layerIndex === 1 && activeLayer?.type === "kb" && (
          <KbLayer kb={activeKb} onSave={handleSaveKb} onDelete={handleDeleteKb} />
        )}
      </div>
    </aside>
  );
}

AiAnswerSidebar.propTypes = {
  selectedNode: PropTypes.object,
  updateNode: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};