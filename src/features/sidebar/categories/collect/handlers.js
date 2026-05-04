import {
  handleAddCarousel,
  handleAddForm,
  handleRemoveCarouselCard,
} from "../../helper";

export function getCollectHandlers({
  selectedNode,
  nodes,
  edges,
  getNextNodeId,
  setNodes,
  setEdges,
  updateNode,
  nodeData,
}) {
  const updater = (updatedData, type) => {
    updateNode({ [type]: updatedData });
  };

  const removeItem = (Id, type) => {
    const items = nodeData?.[type] ?? [];
    updater(
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
      reorderCards: (cards) => updater(cards, "cards"),
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
      updateCardTitle: (cardId, title) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === cardId ? { ...n, data: { ...n.data, title } } : n,
          ),
        );
        const cards = nodeData?.cards ?? [];
        updater(
          cards.map((card) => {
            const id = typeof card === "string" ? card : card?.id;
            if (id !== cardId) return card;
            return typeof card === "string"
              ? { id: card, title }
              : { ...card, title };
          }),
          "cards",
        );
      },
      updateButtonTitle: (cardId, buttonId, title) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === buttonId ? { ...n, data: { ...n.data, title } } : n,
          ),
        );
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id !== cardId) return n;
            const buttons = (n.data.buttons ?? []).map((b) =>
              b.id === buttonId ? { ...b, title } : b,
            );
            return { ...n, data: { ...n.data, buttons } };
          }),
        );
        const cards = nodeData?.cards ?? [];
        updater(
          cards.map((card) => {
            if ((typeof card === "string" ? card : card?.id) !== cardId)
              return card;
            const buttons = (card.buttons ?? []).map((b) =>
              b.id === buttonId ? { ...b, title } : b,
            );
            return { ...card, buttons };
          }),
          "cards",
        );
      },
    },
    form: {
      reorderFields: (fields) => updater(fields, "fields"),
      updateFieldLabel: (fieldId, label) => {
        const fields = nodeData?.fields ?? [];
        updater(
          fields.map((field) =>
            field.id === fieldId ? { ...field, label } : field,
          ),
          "fields",
        );
      },
      updateFieldType: (fieldId, type) => {
        const fields = nodeData?.fields ?? [];
        updater(
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
