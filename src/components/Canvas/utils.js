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
  metaType = "",
  iCategory = "",
  icon = "",
  groupId,
  isValidDragConn = true,
}) {
  const node = {
    id,
    type,
    position: { x, y },
    data: {
      id,
      inPorts,
      outPorts,
      icon,
      connected,
      title,
      description,
      type: metaType,
      iCategory: iCategory,
      isValidDragConn,
    },
  };
  // groupId enables group-drag: dragging any member moves the whole carousel group.
  if (groupId) node.data.groupId = groupId;
  return node;
}

export function createEdge(
  source,
  target,
  isNotDeletable = false,
  sourceHandle = "",
  hidden,
) {
  const handle = sourceHandle || "default";

  return {
    id: `edge_${source}_${handle}_${target}`,
    source,
    target,
    hidden,
    sourceHandle: handle,
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
  delay = false,
  doubleHandler = false,
  sourceHandle = "",
}) {
  const newNodeId = getNextNodeId();
  const title = getIncrementalTitle({
    allNodes,
    metaType: nodeData?.type ?? "collectInput",
    baseTitle: "Enter Input",
  });
  let newNode = {};

  if (delay) {
    const newNodeDelay = createFlowNode({
      id: newNodeId,
      x: sourceNode.position.x,
      y: sourceNode.position.y + 220,
      inPorts: [sourceNodeId],
      title: "Delay",
      metaType: "delay",
      icon: "◔",
      iCategory: "collect",
    });
    newNode = {
      ...newNodeDelay,
      data: { ...newNodeDelay.data, delayDuration: 1 },
    };
  } else if (doubleHandler) {
    const newNodeDelay = createFlowNode({
      id: newNodeId,
      x: sourceNode.position.x,
      y: sourceNode.position.y + 220,
      inPorts: [sourceNodeId],
      title: "AI Answer",
      metaType: "ai_answer",
      description: "Ai Answer",
      icon: "🤖",
      iCategory: "ai",
    });
    newNode = {
      ...newNodeDelay,
      data: {
        ...newNodeDelay.data,
        doubleHandler: true,
        successOutport: [],
        failureOutport: [],
      },
    };
  } else {
    newNode = createFlowNode({
      id: newNodeId,
      x: sourceNode.position.x,
      y: sourceNode.position.y + 220,
      inPorts: [sourceNodeId],
      title,
      description: "Enter Description",
      metaType: nodeData?.type ?? "collectInput",
      iCategory: "collect",
    });
  }

  return {
    nodesToAdd: [newNode],
    edgesToAdd: [createEdge(sourceNodeId, newNodeId, false, sourceHandle)],
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
  sourceHandle = "",
}) {
  const carouselId = getNextNodeId();
  const carouselTitle = getIncrementalTitle({
    allNodes,
    metaType: "carousel",
    baseTitle: "Carousel",
  });

  const cardIds = [getNextNodeId(), getNextNodeId()];
  const buttonIds = [getNextNodeId(), getNextNodeId()];

  // Full card objects — include button details so everything is in one place
  const cards = cardIds.map((id, index) => ({
    id,
    title: `Card ${index + 1}`,
    description: "",
    buttons: [{ id: buttonIds[index], title: `Button ${index + 1}` }],
  }));

  const baseX = sourceNode.position.x;
  const baseY = sourceNode.position.y;

  const carouselY = baseY + NODE_HEIGHT + VERTICAL_GAP;
  const cardY = carouselY + NODE_HEIGHT + VERTICAL_GAP;
  const buttonY = cardY + NODE_HEIGHT + VERTICAL_GAP;

  const totalWidth =
    cardIds.length * NODE_WIDTH + (cardIds.length - 1) * HORIZONTAL_GAP;

  const startX = baseX - totalWidth / 2 + NODE_WIDTH / 2;

  //  Carousel Node (absolute position)
  const carouselNode = createFlowNode({
    id: carouselId,
    x: baseX,
    y: carouselY,
    inPorts: [sourceNodeId],
    title: carouselTitle,
    description: "Carousel Node",
    metaType: "carousel",
    iCategory: "collect",
  });

  carouselNode.data.cards = cards;
  carouselNode.data.outPorts = cardIds;
  carouselNode.data.connected = cards.length > 0;

  const nodes = [carouselNode];
  const edges = [createEdge(sourceNodeId, carouselId, false, sourceHandle)];

  cards.forEach((card, index) => {
    const cardId = card.id;
    const x = startX + index * (NODE_WIDTH + HORIZONTAL_GAP);
    const buttonId = card.buttons[0].id;

    // Card node — stores its own buttons array
    nodes.push(
      createFlowNode({
        id: cardId,
        x,
        y: cardY,
        isValidDragConn: false,
        inPorts: [carouselId],
        metaType: "carouselCard",
        connected: true,
        outPorts: [buttonId],
        title: card.title,
        iCategory: "collect",
        groupId: carouselId,
      }),
    );
    nodes[nodes.length - 1].data.buttons = card.buttons;
    nodes[nodes.length - 1].data.description = card.description;

    // Button node — stores its own details
    nodes.push(
      createFlowNode({
        id: buttonId,
        x,
        y: buttonY,
        isValidDragConn: false,
        inPorts: [cardId],
        metaType: "carouselButton",
        title: card.buttons[0].title,
        iCategory: "collect",
        groupId: carouselId,
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
  sourceHandle = "",
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
    iCategory: "collect",
  });

  // Embed fields directly into the node's data
  newNode.data.fields = nodeData.fields ?? [];

  return {
    nodesToAdd: [newNode],
    edgesToAdd: [createEdge(sourceNodeId, newNodeId, sourceHandle)],
    selectedNodeId: newNodeId,
  };
}

export function buildMenuActionMap({
  context,
  templates,
  getNextNodeId,
  sourceHandle,
}) {
  return {
    carousel: () =>
      buildCarouselPayload({ ...context, getNextNodeId, sourceHandle }),
    collectInput: () =>
      buildSingleNodePayload({
        ...context,
        nodeData: templates.collectInput,
        getNextNodeId,
        sourceHandle,
      }),
    form: () =>
      buildFormPayload({
        ...context,
        nodeData: templates.form,
        getNextNodeId,
        sourceHandle,
      }),
    delay: () =>
      buildSingleNodePayload({
        ...context,
        nodeData: templates.collectInput,
        getNextNodeId,
        delay: true,
        sourceHandle,
      }),
    answer_ai: () =>
      buildSingleNodePayload({
        ...context,
        nodeData: templates.collectInput,
        getNextNodeId,
        doubleHandler: true,
        sourceHandle,
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
    description: "",
    buttons: [{ id: newButtonId, title: `Button ${existingCards.length + 1}` }],
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
    existingCards.length > 0
      ? lastCardX + NODE_WIDTH + HORIZONTAL_GAP
      : lastCardX;

  // New card node — stores its own buttons array
  const cardNode = createFlowNode({
    id: newCardId,
    x: newCardX,
    isValidDragConn: false,
    y: cardY,
    inPorts: [selectedNodeId],
    connected: true,
    outPorts: [newButtonId],
    metaType: "carouselCard",
    title: newCard.title,
    iCategory: "collect",
    groupId: selectedNodeId,
  });
  cardNode.data.buttons = newCard.buttons;
  cardNode.data.description = newCard.description;
  nodesToAdd.push(cardNode);

  // New button node
  nodesToAdd.push(
    createFlowNode({
      id: newButtonId,
      x: newCardX,
      isValidDragConn: false,
      y: buttonY,
      inPorts: [newCardId],
      metaType: "carouselButton",
      title: newCard.buttons[0].title,
      iCategory: "collect",
      groupId: selectedNodeId,
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

    if (!removedBySource.has(edge.source)) {
      removedBySource.set(edge.source, []);
    }

    removedBySource.get(edge.source).push({
      target: edge.target,
      handle: edge.sourceHandle,
    });

    if (!removedByTarget.has(edge.target)) {
      removedByTarget.set(edge.target, new Set());
    }

    removedByTarget.get(edge.target).add(edge.source);
  });

  return nodes.map((node) => {
    const removedTargets = removedBySource.get(node.id);
    const removedSources = removedByTarget.get(node.id);

    if (!removedTargets && !removedSources) return node;

    let nextOutPorts = node.data.outPorts || [];
    let nextInPorts = node.data.inPorts || [];
    let nextSuccess = node.data.successOutport || [];
    let nextFailure = node.data.failureOutport || [];

    if (removedTargets) {
      removedTargets.forEach(({ target, handle }) => {
        if (handle === "success") {
          nextSuccess = nextSuccess.filter((t) => t !== target);
        } else if (handle === "failure") {
          nextFailure = nextFailure.filter((t) => t !== target);
        } else {
          nextOutPorts = nextOutPorts.filter((t) => t !== target);
        }
      });
    }

    // Handle target side (incoming)
    if (removedSources) {
      nextInPorts = nextInPorts.filter(
        (sourceId) => !removedSources.has(sourceId),
      );
    }

    const isConnected =
      nextOutPorts.length > 0 ||
      nextInPorts.length > 0 ||
      nextSuccess.length > 0 ||
      nextFailure.length > 0;

    return {
      ...node,
      data: {
        ...node.data,
        outPorts: nextOutPorts,
        inPorts: nextInPorts,
        successOutport: nextSuccess,
        failureOutport: nextFailure,
        connected: isConnected,
      },
    };
  });
}
