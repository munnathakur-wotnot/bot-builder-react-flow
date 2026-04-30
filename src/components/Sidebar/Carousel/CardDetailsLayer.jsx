import React from "react";
import PropTypes from "prop-types";
import AppInput from "../../Common/AppInput";
import useNodeUpdater from "../../../hooks/useNodeUpdater";

export default function CardDetailsLayer({
  card,
  onBack,
  onUpdateCard,
  setNodes,
}) {
  const { updateNode } = useNodeUpdater({
    nodeId: card.id,
    setNodes,
  });
  updateNode();
  return (
    <div className="node-sidebar__layer">
      <button
        type="button"
        className="node-sidebar__back-button"
        onClick={() => onBack({ number: 1, data: null })}
      >
        ← Back
      </button>

      <p className="node-sidebar__section-title">Card Properties</p>

      <label className="node-sidebar__label">
        Card Title
        <AppInput
          className="node-sidebar__input"
          value={card.title}
          onChange={(e) => onUpdateCard(card.id, e.target.value)}
          placeholder="Enter card title"
        />
      </label>

      {/* <label className="node-sidebar__label">
        Card Description
        <textarea
          className="node-sidebar__textarea"
          value={card.description}
          onChange={(e) => onUpdateCard("title", e.target.value)}
          placeholder="Enter card description"
        />
      </label> */}
    </div>
  );
}

CardDetailsLayer.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,

    description: PropTypes.string,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  onUpdateCard: PropTypes.func.isRequired,
  setNodes: PropTypes.func,
};
