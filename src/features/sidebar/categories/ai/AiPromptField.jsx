import React from "react";
import PropTypes from "prop-types";
import { InfoIcon, ExternalLinkIcon } from "../../../../shared/ui/atoms/icons";

export default function AiPromptField({ value, onChange }) {
  return (
    <div className="ai-field">
      <div className="ai-field__label-row">
        <span className="ai-field__label">Prompt</span>
        <span className="ai-field__info-icon"><InfoIcon /></span>
        <button type="button" className="ai-field__external-btn" aria-label="Open prompt editor">
          <ExternalLinkIcon />
        </button>
      </div>
      <textarea
        className="ai-field__textarea ai-field__textarea--tall"
        value={value}
        onChange={onChange}
        placeholder="Enter your prompt\u2026"
      />
    </div>
  );
}
AiPromptField.propTypes = { value: PropTypes.string, onChange: PropTypes.func.isRequired };
AiPromptField.defaultProps = { value: "" };