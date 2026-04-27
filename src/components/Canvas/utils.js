export function createFlowNode({
  id,
  x,
  y,
  type = "custom",
  inPorts = [],
  outPorts = [],
  connected = false,
  title = "",
  description = "",
  metaType = "", // your custom type (carousel, card, etc.)
}) {
  return {
    id,
    type,
    position: { x, y },
    data: {
      id,
      inPorts,
      outPorts,
      connected,
      title,
      description,
      type: metaType,
    },
  };
}

export function createEdge(source, target) {
  return {
    id: `edge_${source}_${target}`,
    source,
    target,
    type: "custom",
  };
}

export function buildSingleNodePayload({
  sourceNode,
  sourceNodeId,
  nodeData,
  getNextNodeId,
}) {
  const newNodeId = getNextNodeId();
  console.log(sourceNode, "Hello");

  const newNode = createFlowNode({
    id: newNodeId,
    x: sourceNode.position.x,
    y: sourceNode.position.y + 220,
    inPorts: [sourceNodeId],
    title: "Enter Input",
    description: "Enter Description",
  });
  console.log(newNode, "New Node");

  return {
    nodesToAdd: [newNode],
    edgesToAdd: [createEdge(sourceNodeId, newNodeId)],
    dataPatch: {
      [newNodeId]: { ...nodeData, inPorts: [sourceNodeId] },
    },
    selectedNodeId: newNodeId,
  };
}

export function buildCarouselPayload({
  sourceNode,
  sourceNodeId,
  getNextNodeId,
}) {
  const carouselId = getNextNodeId();
  const cardOneId = getNextNodeId();
  const cardTwoId = getNextNodeId();
  const buttonOneId = getNextNodeId();
  const buttonTwoId = getNextNodeId();

  const carouselX = sourceNode.position.x;
  const carouselY = sourceNode.position.y + 220;
  const cardY = carouselY + 120;
  const buttonY = cardY + 100;

  const carouselNode = createFlowNode({
    id: carouselId,
    x: carouselX,
    y: carouselY,
    inPorts: [sourceNodeId],
    title: "Carousel",
    description: "Carousel Node",
    metaType: "carousel",
  });
  // Keep track of cards on the carousel so "Add Card" can position new cards correctly.
  carouselNode.data.cards = [cardOneId, cardTwoId];

  return {
    nodesToAdd: [
      carouselNode,
      createFlowNode({
        id: cardOneId,
        x: carouselX - 120,
        y: cardY,
        title: "Card 1",
        description: "Carousel Node",
        inPorts: [carouselId],
        metaType: "carouselCard",
      }),
      createFlowNode({
        id: cardTwoId,
        x: carouselX + 120,
        y: cardY,
        inPorts: [carouselId],
        metaType: "carouselCard",
        title: "Card 2",
        description: "Carousel Node",
      }),
      createFlowNode({
        id: buttonOneId,
        x: carouselX - 120,
        y: buttonY,
        inPorts: [cardOneId],
        metaType: "carouselButton",
        title: "Button",
      }),
      createFlowNode({
        id: buttonTwoId,
        x: carouselX + 120,
        y: buttonY,
        inPorts: [cardTwoId],
        metaType: "carouselButton",
        title: "Button",
      }),
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
        inPorts: [sourceNodeId],
      },
      [cardOneId]: {
        type: "carouselCard",
        title: "Card 1",
        description: "",
        inPorts: [carouselId],
      },
      [cardTwoId]: {
        type: "carouselCard",
        title: "Card 2",
        description: "",
        inPorts: [carouselId],
      },
      [buttonOneId]: {
        type: "carouselButton",
        title: "Button 1",
        description: "",
        inPorts: [cardOneId],
      },
      [buttonTwoId]: {
        type: "carouselButton",
        title: "Button 1",
        description: "",
        inPorts: [cardTwoId],
      },
    },
    selectedNodeId: carouselId,
  };
}

export function buildFormPayload({ sourceNode, sourceNodeId, nodeData, getNextNodeId }) {
  const newNodeId = getNextNodeId();

  const newNode = createFlowNode({
    id: newNodeId,
    x: sourceNode.position.x,
    y: sourceNode.position.y + 220,
    inPorts: [sourceNodeId],
    title: nodeData.title ?? "Form",
    description: nodeData.description ?? "",
    metaType: "form",
  });

  // Embed fields directly into the node's data
  newNode.data.fields = nodeData.fields ?? [];

  return {
    nodesToAdd: [newNode],
    edgesToAdd: [createEdge(sourceNodeId, newNodeId)],
    selectedNodeId: newNodeId,
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
    form: () =>
      buildFormPayload({
        ...context,
        nodeData: templates.form,
        getNextNodeId,
      }),
  };
}

export function buildAddCarouselCardPayload({
  selectedNodeId,
  carouselNode,
  getNextNodeId,
}) {
  const existingCards = carouselNode?.data?.cards ?? [];
  const nextCardIndex = existingCards.length + 1;
  const cardId = getNextNodeId();
  const buttonId = getNextNodeId();

  // Layout: keep cards spread horizontally under the carousel.
  // Initial template uses -120 / +120 around carouselX; for additional cards,
  // extend to the right using a wider spacing so cards never overlap.
  const spacingX = 240;
  const cardX =
    carouselNode.position.x + (existingCards.length - 0.5) * spacingX;
  const cardY = carouselNode.position.y + 120;
  const buttonY = cardY + 100;

  return {
    nodesToAdd: [
      createFlowNode({
        id: cardId,
        x: cardX,
        y: cardY,
        inPorts: [selectedNodeId],
        metaType: "carouselCard",
        title: `Card ${nextCardIndex}`,
        description: "Carousel Node",
      }),
      createFlowNode({
        id: buttonId,
        x: cardX,
        y: buttonY,
        inPorts: [cardId],
        metaType: "carouselButton",
        title: "Button",
      }),
    ],
    edgesToAdd: [
      createEdge(selectedNodeId, cardId),
      createEdge(cardId, buttonId),
    ],
    dataPatch: {
      [selectedNodeId]: {
        cards: [...existingCards, cardId],
      },
      [cardId]: {},
      [buttonId]: {},
    },
  };
}
