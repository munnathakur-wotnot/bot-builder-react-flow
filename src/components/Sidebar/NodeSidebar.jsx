import React from "react";
import PropTypes from "prop-types";
import "./NodeSidebar.css";

export default function NodeSidebar({
  selectedNodeData,
  onChangeTitle,
  onChangeDescription,
  onAddCarouselCard,
  onClose,
}) {
  if (!selectedNodeData) return null;

  return (
    <aside className="node-sidebar">
      <div className="node-sidebar__header">
        <h3 className="node-sidebar__title">Node Config</h3>
        <button
          type="button"
          className="node-sidebar__close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>

      <label className="node-sidebar__label">
        Title
        <input
          className="node-sidebar__input"
          value={selectedNodeData.title ?? ""}
          onChange={(event) => onChangeTitle(event.target.value)}
        />
      </label>

      <label className="node-sidebar__label">
        Description
        <textarea
          className="node-sidebar__textarea"
          value={selectedNodeData.description ?? ""}
          onChange={(event) => onChangeDescription(event.target.value)}
        />
      </label>

      {selectedNodeData.type === "carousel" ? (
        <button
          type="button"
          className="node-sidebar__add-card-button"
          onClick={onAddCarouselCard}
        >
          + Add Card
        </button>
      ) : null}
    </aside>
  );
}

NodeSidebar.propTypes = {
  selectedNodeData: PropTypes.shape({
    type: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
  }),
  onChangeTitle: PropTypes.func.isRequired,
  onChangeDescription: PropTypes.func.isRequired,
  onAddCarouselCard: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

NodeSidebar.defaultProps = {
  selectedNodeData: null,
};
