import React from "react";
import PropTypes from "prop-types";
import { DragIcon } from "../atoms/icons";
import "./DraggableRow.css";

/**
 * Reusable drag-sortable row shell.
 *
 * Props:
 *   dragHandleProps / dragListeners  — spread onto the drag handle (from DragDropList)
 *   onNavigate                       — called when the card body is clicked (optional)
 *   onRemove                         — called when × is clicked (optional — hides button if absent)
 *   showRemove                       — explicit override; defaults to true when onRemove is provided
 *   children                         — content rendered inside the clickable card area
 */
export default function DraggableRow({
  dragHandleProps,
  dragListeners,
  onNavigate,
  onRemove,
  showRemove = true,
  children,
}) {
  return (
    <div className="draggable-row">
      {/* Drag handle */}
      <span
        className="draggable-row__handle"
        {...dragHandleProps}
        {...dragListeners}
        title="Drag to reorder"
      >
        <DragIcon />
      </span>

      {/* Clickable card body */}
      <div
        className="draggable-row__card"
        onClick={onNavigate}
        role={onNavigate ? "button" : undefined}
        tabIndex={onNavigate ? 0 : undefined}
        onKeyDown={
          onNavigate ? (e) => e.key === "Enter" && onNavigate() : undefined
        }
      >
        <div className="draggable-row__content">{children}</div>
        {onNavigate && (
          <span className="draggable-row__chevron" aria-hidden="true">
            ›
          </span>
        )}
      </div>

      {/* Remove button */}
      {onRemove && showRemove && (
        <button
          type="button"
          className="draggable-row__remove"
          onClick={onRemove}
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </div>
  );
}

DraggableRow.propTypes = {
  dragHandleProps: PropTypes.object,
  dragListeners: PropTypes.object,
  onNavigate: PropTypes.func,
  onRemove: PropTypes.func,
  showRemove: PropTypes.bool,
  children: PropTypes.node.isRequired,
};
