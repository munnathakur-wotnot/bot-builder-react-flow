import React from "react";
import "./Card.css";
import PropTypes from "prop-types";
import DragDropList from "../../Common/ListDragDrop";

const Card = ({ nodeData, removeCard, reorderCards, onNavigate }) => {
  const cards = nodeData?.cards ?? [];

  return (
    <div className="card-list">
      <DragDropList
        items={cards}
        setItems={reorderCards}
        getId={(card, index) =>
          typeof card === "string" ? card : (card?.id ?? `card-${index}`)
        }
        renderItem={(card, { dragHandleProps, dragListeners }) => {
          const cardId = typeof card === "string" ? card : card?.id;
          const cardTitle = typeof card === "string" ? card : card?.title;
          return (
            <div className="card-container" style={{ marginBottom: "10px" }}>
              <div className="card">
                <div className="card-left">
                  <span
                    {...dragHandleProps}
                    {...dragListeners}
                    style={{ cursor: "grab", marginRight: "8px" }}
                  >
                    ☰
                  </span>
                  <div className="card-icon">📷</div>
                  <span className="card-title">{cardTitle}</span>
                </div>

                <div className="card-actions">
                  <button
                    type="button"
                    className="card-chevron"
                    onClick={() => onNavigate?.({ id: cardId, title: cardTitle })}
                    aria-label="Edit card"
                  >
                    ›
                  </button>
                  <button
                    type="button"
                    className="card-delete"
                    onClick={() => removeCard(cardId)}
                    aria-label="Remove card"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default Card;

Card.propTypes = {
  nodeData: PropTypes.object,
  removeCard: PropTypes.func,
  reorderCards: PropTypes.func,
  onNavigate: PropTypes.func,
};

