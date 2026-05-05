import React, { useCallback } from "react";
import PropTypes from "prop-types";
import ConditionRow from "./ConditionRow";
import "./ConditionEditor.css";
export default function ConditionEditor({
  branchNode,
  onUpdateConditions,
  onUpdateConditionType,
}) {
  const branchId      = branchNode?.id;
  const conditionType = branchNode?.conditionType ?? "ALL";
  const rawConditions = branchNode?.conditions ?? [];

  // Always show at least one empty row
  const conditions =
    rawConditions.length > 0
      ? rawConditions
      : [{ id: `cond_${Date.now()}`, field: "", operator: "eq", value: "" }];

  const handleToggle = useCallback(
    (type) => onUpdateConditionType(branchId, type),
    [branchId, onUpdateConditionType],
  );

  const handleChange = useCallback(
    (index, updated) => {
      const next = conditions.map((c, i) => (i === index ? updated : c));
      onUpdateConditions(branchId, next);
    },
    [branchId, conditions, onUpdateConditions],
  );

  const handleAdd = useCallback(() => {
    onUpdateConditions(branchId, [
      ...conditions,
      { id: `cond_${Date.now()}`, field: "", operator: "eq", value: "" },
    ]);
  }, [branchId, conditions, onUpdateConditions]);

  const handleRemove = useCallback(
    (index) => {
      onUpdateConditions(
        branchId,
        conditions.filter((_, i) => i !== index),
      );
    },
    [branchId, conditions, onUpdateConditions],
  );

  if (!branchNode) return null;

  return (
    <div className="cond-editor">
      {/* ANY / ALL toggle */}
      <div className="cond-editor__match-row">
        <span className="cond-editor__match-label">Match</span>
        <div className="cond-editor__toggle" role="group" aria-label="Match type">
          <button
            type="button"
            className={`cond-toggle__btn${conditionType === "ALL" ? " cond-toggle__btn--active" : ""}`}
            onClick={() => handleToggle("ALL")}
          >
            All
          </button>
          <button
            type="button"
            className={`cond-toggle__btn${conditionType === "ANY" ? " cond-toggle__btn--active" : ""}`}
            onClick={() => handleToggle("ANY")}
          >
            Any
          </button>
        </div>
        <span className="cond-editor__match-label">conditions</span>
      </div>

      {/* Condition rows */}
      <div className="cond-editor__list">
        {conditions.map((cond, i) => (
          <ConditionRow
            key={cond.id ?? i}
            condition={cond}
            onChange={(updated) => handleChange(i, updated)}
            onRemove={() => handleRemove(i)}
            canRemove={conditions.length > 1}
          />
        ))}
      </div>

      {/* Add condition */}
      <button
        type="button"
        className="node-sidebar__add-field-button"
        onClick={handleAdd}
      >
        + Add Condition
      </button>
    </div>
  );
}

ConditionEditor.propTypes = {
  branchNode: PropTypes.shape({
    id: PropTypes.string,
    conditionType: PropTypes.oneOf(["ALL", "ANY"]),
    conditions: PropTypes.array,
  }),
  onUpdateConditions: PropTypes.func.isRequired,
  onUpdateConditionType: PropTypes.func.isRequired,
};
