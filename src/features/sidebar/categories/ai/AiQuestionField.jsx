import React from "react";
import PropTypes from "prop-types";

export default function AiQuestionField({ value, onChange }) {
  return (
    <div className="ai-field">
      <label className="ai-field__label" htmlFor="ai-question">Question</label>
      <textarea
        id="ai-question"
        className="ai-field__textarea"
        value={value}
        onChange={onChange}
        placeholder="How can I help you?"
      />
      <p className="ai-field__hint">
        You can reference a <span className="ai-field__hint-link">variable</span> by typing #
      </p>
    </div>
  );
}
AiQuestionField.propTypes = { value: PropTypes.string, onChange: PropTypes.func.isRequired };
AiQuestionField.defaultProps = { value: "" };