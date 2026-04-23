export function createFlowNode(id, x, y) {
  return {
    id,
    type: "custom",
    position: { x, y },
    data: { id },
  };
}

export function createEdge(source, target) {
  return {
    id: `edge_${source}_${target}`,
    source,
    target,
    type: "smoothstep",
  };
}

export function buildSingleNodePayload({
  sourceNode,
  sourceNodeId,
  nodeData,
  getNextNodeId,
}) {
  const newNodeId = getNextNodeId();
  const newNode = createFlowNode(
    newNodeId,
    sourceNode.position.x,
    sourceNode.position.y + 220,
  );

  return {
    nodesToAdd: [newNode],
    edgesToAdd: [createEdge(sourceNodeId, newNodeId)],
    dataPatch: {
      [newNodeId]: nodeData,
    },
    selectedNodeId: newNodeId,
  };
}

export function buildCarouselPayload({ sourceNode, sourceNodeId, getNextNodeId }) {
  const carouselId = getNextNodeId();
  const cardOneId = getNextNodeId();
  const cardTwoId = getNextNodeId();
  const buttonOneId = getNextNodeId();
  const buttonTwoId = getNextNodeId();

  const carouselX = sourceNode.position.x;
  const carouselY = sourceNode.position.y + 220;
  const cardY = carouselY + 120;
  const buttonY = cardY + 100;

  return {
    nodesToAdd: [
      createFlowNode(carouselId, carouselX, carouselY),
      createFlowNode(cardOneId, carouselX - 120, cardY),
      createFlowNode(cardTwoId, carouselX + 120, cardY),
      createFlowNode(buttonOneId, carouselX - 120, buttonY),
      createFlowNode(buttonTwoId, carouselX + 120, buttonY),
    ],
    edgesToAdd: [
      createEdge(sourceNodeId, carouselId),
      createEdge(carouselId, cardOneId),
      createEdge(carouselId, cardTwoId),
      createEdge(cardOneId, buttonOneId),
      createEdge(cardTwoId, buttonTwoId),
    ],
    dataPatch: {
      [carouselId]: {
        type: "carousel",
        title: "Carousel 1",
        description: "Swipe to explore cards",
        cards: [cardOneId, cardTwoId],
      },
      [cardOneId]: {
        type: "carouselCard",
        title: "Card 1",
        description: "",
      },
      [cardTwoId]: {
        type: "carouselCard",
        title: "Card 2",
        description: "",
      },
      [buttonOneId]: {
        type: "carouselButton",
        title: "Button 1",
        description: "",
      },
      [buttonTwoId]: {
        type: "carouselButton",
        title: "Button 1",
        description: "",
      },
    },
    selectedNodeId: carouselId,
  };
}

export function buildMenuActionMap({ context, templates, getNextNodeId }) {
  return {
    carousel: () => buildCarouselPayload({ ...context, getNextNodeId }),
    collectInput: () =>
      buildSingleNodePayload({
        ...context,
        nodeData: templates.collectInput,
        getNextNodeId,
      }),
  };
}

export function buildAddCarouselCardPayload({
  selectedNodeId,
  carouselNodeData,
  carouselNode,
  getNextNodeId,
}) {
  const nextCardIndex = (carouselNodeData.cards?.length ?? 0) + 1;
  const cardId = getNextNodeId();
  const buttonId = getNextNodeId();
  const cardX = carouselNode.position.x + (nextCardIndex - 2) * 170;
  const cardY = carouselNode.position.y + 120;
  const buttonY = cardY + 100;

  return {
    nodesToAdd: [
      createFlowNode(cardId, cardX, cardY),
      createFlowNode(buttonId, cardX, buttonY),
    ],
    edgesToAdd: [createEdge(selectedNodeId, cardId), createEdge(cardId, buttonId)],
    dataPatch: {
      [selectedNodeId]: {
        cards: [...(carouselNodeData.cards ?? []), cardId],
      },
      [cardId]: {
        type: "carouselCard",
        title: `Card ${nextCardIndex}`,
        description: "",
      },
      [buttonId]: {
        type: "carouselButton",
        title: "Button 1",
        description: "",
      },
    },
  };
}
