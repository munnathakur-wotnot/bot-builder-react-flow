import React from "react";
import "./card.css";
import PropTypes from "prop-types";
import DragDropList from "../../../../shared/ui/molecules/ListDragDrop";

const DragIcon = () => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="2.5" cy="2" r="1.5" fill="currentColor"/>
    <circle cx="7.5" cy="2" r="1.5" fill="currentColor"/>
    <circle cx="2.5" cy="7" r="1.5" fill="currentColor"/>
    <circle cx="7.5" cy="7" r="1.5" fill="currentColor"/>
    <circle cx="2.5" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="7.5" cy="12" r="1.5" fill="currentColor"/>
  </svg>
);

const CardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="3"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

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
            <div className="card-container">
              <div className="card">
                <div className="card-left">
                  <span
                    {...dragHandleProps}
                    {...dragListeners}
                    className="card-drag-handle"
                    title="Drag to reorder"
                  >
                    <DragIcon />
                  </span>
                  <div className="card-icon">
                    <CardIcon />
                  </div>
                  <span className="card-title">{cardTitle}</span>
                </div>

                <div className="card-actions">
                  <button
                    type="button"
                    className="card-chevron"
                    onClick={() => onNavigate?.({ id: cardId, title: cardTitle })}
                    aria-label="Edit card"
                  >
                    {"\u203A"}
                  </button>
                  {cards?.length > 1 && (
                    <button
                      type="button"
                      className="card-delete"
                      onClick={() => removeCard(cardId)}
                      aria-label="Remove card"
                    >
                      {"\u00D7"}
                    </button>
                  )}
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