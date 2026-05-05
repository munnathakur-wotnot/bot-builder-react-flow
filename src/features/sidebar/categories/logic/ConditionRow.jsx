import React, { useCallback } from "react";
import PropTypes from "prop-types";
import AppInput from "../../../../shared/ui/atoms/AppInput";
import CustomSelect from "../../../../shared/ui/atoms/CustumSelect";
import { OPERATORS, NO_VALUE_OPS } from "./constants";
import "./ConditionEditor.css";

export default function ConditionRow({ condition, onChange, onRemove, canRemove }) {
  const handleField = useCallback(
    (e) => onChange({ ...condition, field: e.target.value }),
    [condition, onChange],
  );

  const handleOperator = useCallback(
    (opt) => onChange({ ...condition, operator: opt.value, value: "" }),
    [condition, onChange],
  );

  const handleValue = useCallback(
    (e) => onChange({ ...condition, value: e.target.value }),
    [condition, onChange],
  );

  const noValue = NO_VALUE_OPS.has(condition.operator);

  return (
    <div className="cond-row">
      <div className="cond-row__fields">
        <AppInput
          className="cond-row__input"
          value={condition.field ?? ""}
          onChange={handleField}
          placeholder="Variable"
        />
        <CustomSelect
          options={OPERATORS}
          value={OPERATORS.find((op) => op.value === (condition.operator ?? "eq")) ?? null}
          onChange={handleOperator}
          placeholder="Select operator..."
        />
        {!noValue && (
          <AppInput
            className="cond-row__input"
            value={condition.value ?? ""}
            onChange={handleValue}
            placeholder="Value"
          />
        )}
      </div>
      {canRemove && (
        <button
          type="button"
          className="cond-row__remove"
          onClick={onRemove}
          aria-label="Remove condition"
        >
          ×
        </button>
      )}
    </div>
  );
}

ConditionRow.propTypes = {
  condition: PropTypes.shape({
    id: PropTypes.string,
    field: PropTypes.string,
    operator: PropTypes.string,
    value: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  canRemove: PropTypes.bool,
};
