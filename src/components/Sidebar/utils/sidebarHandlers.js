import {
  handleAddCarousel,
  handleAddForm,
  handleRemoveCarouselCard,
  updateCarouselCard,
} from "../helper";

export function getSidebarHandlers({
  selectedNode,
  nodes,
  edges,
  getNextNodeId,
  setNodes,
  setEdges,
  updateNode,
  nodeData,
}) {
  const updateter = (updatedData, type) => {
    console.log(updatedData, "hello");

    updateNode({ [type]: updatedData });
  };

  const removeItem = (Id, type) => {
    const items = nodeData?.[type] ?? [];

    updateter(
      items.filter((field) => {
        if (typeof field === "string") return field !== Id;
        return field.id !== Id;
      }),
      type,
    );
  };

  return {
    carousel: {
      addCarouselCard: () =>
        handleAddCarousel({
          selectedNode,
          nodes,
          edges,
          getNextNodeId,
          setNodes,
          setEdges,
          updateNode,
        }),
      reorderCards: (cards) => updateter(cards, "cards"),
      removeCard: (id) =>
        handleRemoveCarouselCard({
          selectedNode,
          nodes,
          edges,
          cardId: id,
          setNodes,
          setEdges,
          updateNode,
        }),
      updateCard: (cardId, patch) =>
        updateCarouselCard(cardId, patch, nodeData, setNodes, updateNode),
      secondLayer: {
        cardUpdater: (cardId, newTitle) => {
          updateSingleNode(nodeId, (node) => {
            const updatedCards = (node.data.cards || []).map((card) =>
              card.id === cardId ? { ...card, title: newTitle } : card,
            );

            return {
              ...node,
              data: {
                ...node.data,
                cards: updatedCards,
              },
            };
          });
        },
      },
    },
    form: {
      reorderFields: (fields) => updateter(fields, "fields"),
      updateFieldLabel: (fieldId, label) => {
        const fields = nodeData?.fields ?? [];

        updateter(
          fields.map((field) =>
            field.id === fieldId ? { ...field, label } : field,
          ),
          "fields",
        );
      },
      updateFieldType: (fieldId, type) => {
        const fields = nodeData?.fields ?? [];
        updateter(
          fields.map((field) =>
            field.id === fieldId ? { ...field, type } : field,
          ),
          "fields",
        );
      },
      removeField: (id) => removeItem(id, "fields"),
      addFormField: () =>
        handleAddForm({
          nodeData,
          updateNode,
        }),
    },
  };
}
