import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import AppInput from "../../../../shared/ui/atoms/AppInput";
import { TrashIcon } from "../../../../shared/ui/atoms/icons";

const DEFAULT_FN_SNIPPET = `// Function receives user message and context
// Return a value to pass to the AI as context
async function handler(message, context) {
  // Your logic here
  return { result: "" };
}`;

export default function FunctionLayer({ layerContext, handlers }) {
  const fn = layerContext ?? {};
  const [name, setName] = useState(fn.name ?? "");
  const [code, setCode] = useState(fn.code ?? DEFAULT_FN_SNIPPET);

  useEffect(() => {
    setName(fn.name ?? "");
    setCode(fn.code ?? DEFAULT_FN_SNIPPET);
  }, [fn.id]);

  const isDirty = name !== (fn.name ?? "") || code !== (fn.code ?? DEFAULT_FN_SNIPPET);

  return (
    <div className="ai-layer">
      <div className="ai-field">
        <label className="ai-field__label" htmlFor="fn-name">Function name</label>
        <AppInput
          id="fn-name"
          className="node-sidebar__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. fetchWeather"
        />
      </div>

      <div className="ai-field">
        <div className="ai-field__label-row">
          <span className="ai-field__label">JavaScript snippet</span>
          <span className="ai-field__badge ai-field__badge--js">JS</span>
        </div>
        <textarea
          className="ai-field__textarea ai-field__textarea--code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
        />
      </div>

      <div className="ai-layer__actions">
        <button
          type="button"
          className="ai-layer__btn ai-layer__btn--danger"
          onClick={() => handlers.ai.deleteFunction(fn.id)}
        >
          <TrashIcon /> Delete
        </button>
        <button
          type="button"
          className={`ai-layer__btn ai-layer__btn--primary${isDirty ? " ai-layer__btn--active" : ""}`}
          onClick={() => handlers.ai.saveFunction({ ...fn, name: name.trim() || "Untitled", code })}
          disabled={!isDirty}
        >
          Save
        </button>
      </div>
    </div>
  );
}

FunctionLayer.propTypes = {
  layerContext: PropTypes.object,
  handlers: PropTypes.object.isRequired,
};