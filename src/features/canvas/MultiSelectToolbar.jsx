import React from "react";
import PropTypes from "prop-types";
import "./MultiSelectToolbar.css";
import { CloneIcon, CopyIcon, DeleteIcon } from "../../shared/ui/atoms/icons";

/**
 * Floating toolbar shown when 2+ nodes are selected.
 * Positioned at the top-center of the canvas viewport.
 */
export default function MultiSelectToolbar({
  selectedIds,
  onCopy,
  onClone,
  onDelete,
}) {
  const count = selectedIds.length;
  if (count < 2) return null;

  return (
    <div
      className="ms-toolbar"
      role="toolbar"
      aria-label="Multi-select actions no-select"
    >
      <span className="ms-toolbar__count">{count} selected</span>

      <div className="ms-toolbar__divider" />

      <button
        type="button"
        className="ms-toolbar__btn"
        title="Copy all"
        onClick={() => onCopy(selectedIds)}
      >
        <CopyIcon />
        <span>Copy</span>
      </button>

      <button
        type="button"
        className="ms-toolbar__btn"
        title="Clone all"
        onClick={() => onClone(selectedIds)}
      >
        <CloneIcon />
        <span>Clone</span>
      </button>

      <button
        type="button"
        className="ms-toolbar__btn ms-toolbar__btn--danger"
        title="Delete all"
        onClick={() => onDelete(selectedIds)}
      >
        <DeleteIcon />
        <span>Delete</span>
      </button>
    </div>
  );
}

MultiSelectToolbar.propTypes = {
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onCopy: PropTypes.func.isRequired,
  onClone: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
