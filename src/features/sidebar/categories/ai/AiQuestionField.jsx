import React from "react";
import PropTypes from "prop-types";
import "./AiAnswerSidebar.css";
import AppTextarea from "../../../../shared/ui/atoms/AppTextArea";

export default function AiQuestionField({ value, onChange }) {
  return (
    <div className="ai-field">
      <AppTextarea
        id="ai-question"
        label="Question"
        value={value}
        onChange={onChange}
        placeholder="How can I help you?"
      />
    </div>
  );
}
AiQuestionField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
AiQuestionField.defaultProps = { value: "" };
