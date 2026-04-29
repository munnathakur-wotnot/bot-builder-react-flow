const NODE_WIDTH = 240;
const NODE_HEIGHT = 120;

const HORIZONTAL_GAP = 80;
const VERTICAL_GAP = 100;

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

export function createEdge(source, target, isNotDeletable = false) {
  return {
    id: `edge_${source}_${target}`,
    source,
    target,
    data: {
      isNotDeletable,
    },
    type: "custom",
  };
}

function getIncrementalTitle({ allNodes = [], metaType, baseTitle }) {
  const typeCount = allNodes.filter(
    (node) => node.data?.type === metaType,
  ).length;
  return typeCount === 0 ? baseTitle : `${baseTitle} ${typeCount + 1}`;
}

export function buildSingleNodePayload({
  sourceNode,
  sourceNodeId,
  nodeData,
  getNextNodeId,
  allNodes,
}) {
  const newNodeId = getNextNodeId();
  const title = getIncrementalTitle({
    allNodes,
    metaType: nodeData?.type ?? "collectInput",
    baseTitle: "Enter Input",
  });

  const newNode = createFlowNode({
    id: newNodeId,
    x: sourceNode.position.x,
    y: sourceNode.position.y + 220,
    inPorts: [sourceNodeId],
    title,
    description: "Enter Description",
    metaType: nodeData?.type ?? "collectInput",
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
  allNodes,
}) {
  const carouselId = getNextNodeId();
  const carouselTitle = getIncrementalTitle({
    allNodes,
    metaType: "carousel",
    baseTitle: "Carousel",
  });

  const cardIds = [getNextNodeId(), getNextNodeId()];
  const cards = cardIds.map((id, index) => ({
    id,
    title: `Card ${index + 1}`,
  }));
  const buttonIds = [getNextNodeId(), getNextNodeId()];

  const baseX = sourceNode.position.x;
  const baseY = sourceNode.position.y;

  const carouselY = baseY + NODE_HEIGHT + VERTICAL_GAP;
  const cardY = carouselY + NODE_HEIGHT + VERTICAL_GAP;
  const buttonY = cardY + NODE_HEIGHT + VERTICAL_GAP;

  const totalWidth =
    cardIds.length * NODE_WIDTH + (cardIds.length - 1) * HORIZONTAL_GAP;

  const startX = baseX - totalWidth / 2 + NODE_WIDTH / 2;

  //  Carousel Node
  const carouselNode = createFlowNode({
    id: carouselId,
    x: baseX,
    y: carouselY,
    inPorts: [sourceNodeId],
    title: carouselTitle,
    description: "Carousel Node",
    metaType: "carousel",
  });

  carouselNode.data.cards = cards;
  carouselNode.data.outPorts = cardIds;
  carouselNode.data.connected = cards.length > 0;

  const nodes = [carouselNode];
  const edges = [createEdge(sourceNodeId, carouselId)];

  cards.forEach((card, index) => {
    const cardId = card.id;
    const x = startX + index * (NODE_WIDTH + HORIZONTAL_GAP);

    const buttonId = buttonIds[index];

    // Card
    nodes.push(
      createFlowNode({
        id: cardId,
        x,
        y: cardY,
        inPorts: [carouselId],
        metaType: "carouselCard",
        connected: true,
        outPorts: [buttonId],
        title: card.title,
      }),
    );

    // Button
    nodes.push(
      createFlowNode({
        id: buttonId,
        x,
        y: buttonY,
        inPorts: [cardId],
        metaType: "carouselButton",
        title: `Button ${index + 1}`,
      }),
    );

    edges.push(createEdge(carouselId, cardId, true));
    edges.push(createEdge(cardId, buttonId, true));
  });

  return {
    nodesToAdd: nodes,
    edgesToAdd: edges,
    dataPatch: {
      [carouselId]: {
        type: "carousel",
        cards,
      },
    },
    selectedNodeId: carouselId,
  };
}

export function buildFormPayload({
  sourceNode,
  sourceNodeId,
  nodeData,
  getNextNodeId,
  allNodes,
}) {
  const newNodeId = getNextNodeId();
  const title = getIncrementalTitle({
    allNodes,
    metaType: nodeData?.type ?? "form",
    baseTitle: nodeData?.title ?? "Form",
  });

  const newNode = createFlowNode({
    id: newNodeId,
    x: sourceNode.position.x,
    y: sourceNode.position.y + 220,
    inPorts: [sourceNodeId],
    title,
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
  allNodes = [],
  getNextNodeId,
}) {
  const existingCards = (carouselNode?.data?.cards ?? []).map((card, index) => {
    if (typeof card === "string") {
      return {
        id: card,
        title: `Card ${index + 1}`,
      };
    }

    return card;
  });

  const newCardId = getNextNodeId();
  const newButtonId = getNextNodeId();
  const newCard = {
    id: newCardId,
    title: `Card ${existingCards.length + 1}`,
  };

  const allCards = [...existingCards, newCard];

  const cardY = carouselNode.position.y + NODE_HEIGHT + VERTICAL_GAP;
  const buttonY = cardY + NODE_HEIGHT + VERTICAL_GAP;

  const nodesToAdd = [];
  const edgesToAdd = [];
  const existingCardIds = existingCards.map((card) => card.id);
  const existingCardNodes = existingCardIds
    .map((id) => allNodes.find((node) => node.id === id))
    .filter(Boolean);
  const lastCardX =
    existingCardNodes.length > 0
      ? existingCardNodes[existingCardNodes.length - 1].position.x
      : carouselNode.position.x;
  const newCardX =
    existingCards.length > 0 ? lastCardX + NODE_WIDTH + HORIZONTAL_GAP : lastCardX;

  // Create only new card
  nodesToAdd.push(
    createFlowNode({
      id: newCardId,
      x: newCardX,
      y: cardY,
      inPorts: [selectedNodeId],
      connected: true,
      outPorts: [newButtonId],
      metaType: "carouselCard",
      title: newCard.title,
    }),
  );

  // Create only new button
  nodesToAdd.push(
    createFlowNode({
      id: newButtonId,
      x: newCardX,
      y: buttonY,
      inPorts: [newCardId],
      metaType: "carouselButton",
      title: `Button ${allCards.length}`,
    }),
  );

  edgesToAdd.push(createEdge(selectedNodeId, newCardId, true));
  edgesToAdd.push(createEdge(newCardId, newButtonId, true));

  return {
    nodesToAdd,
    edgesToAdd,

    dataPatch: {
      [selectedNodeId]: {
        cards: allCards,
      },
    },
  };
}

export function removeNodeConnectionsForEdges(nodes, edgesToRemove) {
  if (!Array.isArray(edgesToRemove) || edgesToRemove.length === 0) return nodes;

  const removedBySource = new Map();
  const removedByTarget = new Map();

  edgesToRemove.forEach((edge) => {
    if (!edge?.source || !edge?.target) return;

    if (!removedBySource.has(edge.source))
      removedBySource.set(edge.source, new Set());
    removedBySource.get(edge.source).add(edge.target);

    if (!removedByTarget.has(edge.target))
      removedByTarget.set(edge.target, new Set());
    removedByTarget.get(edge.target).add(edge.source);
  });

  return nodes.map((node) => {
    const removedTargets = removedBySource.get(node.id);
    const removedSources = removedByTarget.get(node.id);

    if (!removedTargets && !removedSources) return node;

    let nextOutPorts = node.data.outPorts || [];
    let nextInPorts = node.data.inPorts || [];

    if (removedTargets) {
      nextOutPorts = nextOutPorts.filter(
        (targetId) => !removedTargets.has(targetId),
      );
    }

    if (removedSources) {
      nextInPorts = nextInPorts.filter(
        (sourceId) => !removedSources.has(sourceId),
      );
    }

    return {
      ...node,
      data: {
        ...node.data,
        outPorts: nextOutPorts,
        inPorts: nextInPorts,
        connected: nextOutPorts.length > 0 || nextInPorts.length > 0,
      },
    };
  });
}
