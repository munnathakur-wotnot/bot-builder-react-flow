import React from "react";
import "./Card.css";
import PropTypes from "prop-types";
import DragDropList from "../../Common/ListDragDrop";

const Card = ({ nodeData, removeCard, reorderCards, setlayer }) => {
  const cards = nodeData?.cards ?? [];

  return (
    <div className="card-list">
      <DragDropList
        items={cards}
        setItems={reorderCards}
        getId={(card, index) =>
          typeof card === "string" ? card : (card?.id ?? `card-${index}`)
        }
        renderItem={(card, { dragHandleProps, dragListeners }) => (
          <div className="card-container" style={{ marginBottom: "10px" }}>
            <div
              className="card"
              onClick={() => setlayer({ number: 2, data: card })}
            >
              <div className="card-left">
                <span
                  {...dragHandleProps}
                  {...dragListeners}
                  style={{ cursor: "grab", marginRight: "8px" }}
                >
                  ☰
                </span>
                <div className="card-icon">📷</div>
                <span className="card-title">
                  {typeof card === "string" ? card : card?.title}
                </span>
              </div>

              <div
                className="card-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  removeCard(typeof card === "string" ? card : card?.id);
                }}
                style={{
                  width: "30px",
                  color: "red",
                }}
              >
                ✕
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default Card;

Card.propTypes = {
  nodeData: PropTypes.object,
  removeCard: PropTypes.func,
  reorderCards: PropTypes.func,
  onCardClick: PropTypes.func,
  setlayer: PropTypes.func,
};
