import React from "react";
import PropTypes from "prop-types";
import DragDropList from "../../../../shared/ui/molecules/ListDragDrop";
import DraggableRow from "../../../../shared/ui/molecules/DraggableRow";
import { CardIcon } from "../../../../shared/ui/atoms/icons";

const Branches = ({ nodeData, removeCard, reorderCards, onNavigate }) => {
    const cards =
        nodeData?.children?.filter((data) => data.type !== "other") ?? [];

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
                        <DraggableRow
                            dragHandleProps={dragHandleProps}
                            dragListeners={dragListeners}
                            onNavigate={() => onNavigate?.({ id: cardId, title: cardTitle })}
                            onRemove={
                                cards?.length > 1 ? () => removeCard(cardId) : undefined
                            }
                        >
                            <div className="card-icon">
                                <CardIcon />
                            </div>
                            <span className="card-title">{cardTitle}</span>
                        </DraggableRow>
                    );
                }}
            />
        </div>
    );
};

export default Branches;

Branches.propTypes = {
    nodeData: PropTypes.object,
    removeCard: PropTypes.func,
    reorderCards: PropTypes.func,
    onNavigate: PropTypes.func,
};
