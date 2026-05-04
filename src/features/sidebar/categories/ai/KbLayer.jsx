import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import AppInput from "../../../../shared/ui/atoms/AppInput";
import { TrashIcon, CheckIcon } from "../../../../shared/ui/atoms/icons";
import "./AiAnswerSidebar.css";

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

export default function KbLayer({ kb = {}, handlers }) {
  const [name, setName] = useState(kb.name ?? "");
  const [model, setModel] = useState(kb.model ?? "gpt-4o");

  useEffect(() => {
    setName(kb.name ?? "");
    setModel(kb.model ?? "gpt-4o");
  }, [kb.id]);

  const isDirty = name !== (kb.name ?? "") || model !== (kb.model ?? "gpt-4o");

  return (
    <div className="ai-layer">
      <div className="ai-field">
        <label className="ai-field__label" htmlFor="kb-name">
          Knowledge base name
        </label>
        <AppInput
          id="kb-name"
          className="node-sidebar__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Product Docs"
        />
      </div>

      <div className="ai-field">
        <span className="ai-field__label">Model</span>
        <div className="ai-model-grid">
          {KB_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`ai-model-option${model === m.id ? " ai-model-option--selected" : ""}`}
              onClick={() => setModel(m.id)}
            >
              {model === m.id && (
                <span className="ai-model-option__check">
                  <CheckIcon />
                </span>
              )}
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-layer__actions">
        <button
          type="button"
          className="ai-layer__btn ai-layer__btn--danger"
          onClick={() => handlers.ai.deleteKb(kb.id)}
        >
          <TrashIcon /> Delete
        </button>
        <button
          type="button"
          className={`ai-layer__btn ai-layer__btn--primary${isDirty ? " ai-layer__btn--active" : ""}`}
          onClick={() =>
            handlers.ai.saveKb({
              ...kb,
              name: name.trim() || "Untitled",
              model,
            })
          }
          disabled={!isDirty}
        >
          Save
        </button>
      </div>
    </div>
  );
}

KbLayer.propTypes = {
  kb: PropTypes.object,
  handlers: PropTypes.object.isRequired,
};
