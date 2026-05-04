import { Icons } from "../context-menu/contextMenuConfig";

const NODE_WIDTH = 240;
const NODE_HEIGHT = 120;

const HORIZONTAL_GAP = 80;
const VERTICAL_GAP = 100;

/* =========================================================
   CORE HELPERS
========================================================= */

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
      iCategory,
      isValidDragConn,
    },
  };

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
    type: "custom",
    data: { isNotDeletable },
  };
}

function getIncrementalTitle({ allNodes = [], metaType, baseTitle }) {
  const count = allNodes.filter((n) => n.data?.type === metaType).length;
  return count === 0 ? baseTitle : `${baseTitle} ${count + 1}`;
}

/* =========================================================
   NODE CONFIG (🔥 MAIN IMPROVEMENT)
========================================================= */

function getNodeConfig(type, allNodes) {
  const configs = {
    delay: {
      metaType: "delay",
      baseTitle: "Delay",
      icon: "◔",
      iCategory: "logic",
      extraData: { delayDuration: 1 },
    },
    ai_answer: {
      metaType: "ai_answer",
      baseTitle: "Ai Answer",
      icon: "🤖",
      iCategory: "ai",
      description: "Ai Answer",
      extraData: {
        doubleHandler: true,
        successOutport: [],
        failureOutport: [],
      },
    },
    jump: {
      metaType: "jump",
      baseTitle: "Jump",
      icon: Icons.jump,
      iCategory: "logic",
      extraData: {
        jumpNode: { id: "", title: "Select Node" },
      },
    },
    default: {
      metaType: "collectInput",
      baseTitle: "Enter Input",
      description: "Enter Description",
      iCategory: "collect",
      extraData: {},
    },
  };

  const config = configs[type] || configs.default;

  return {
    ...config,
    title: getIncrementalTitle({
      allNodes,
      metaType: config.metaType,
      baseTitle: config.baseTitle,
    }),
  };
}

/* =========================================================
   SINGLE NODE BUILDER ( CLEAN)
========================================================= */

export function buildSingleNodePayload({
  sourceNode,
  sourceNodeId,
  nodeData,
  getNextNodeId,
  allNodes,
  type = "default",
  sourceHandle = "",
}) {
  const newNodeId = getNextNodeId();

  const config = getNodeConfig(type, allNodes);

  const newNode = createFlowNode({
    id: newNodeId,
    x: sourceNode.position.x,
    y: sourceNode.position.y + 220,
    inPorts: [sourceNodeId],
    title: config.title,
    description: config.description,
    metaType: config.metaType,
    icon: config.icon,
    iCategory: config.iCategory,
  });

  newNode.data = {
    ...newNode.data,
    ...config.extraData,
  };

  return {
    nodesToAdd: [newNode],
    edgesToAdd: [createEdge(sourceNodeId, newNodeId, false, sourceHandle)],
    dataPatch: {
      [newNodeId]: {
        ...nodeData,
        inPorts: [sourceNodeId],
      },
    },
    selectedNodeId: newNodeId,
  };
}

/* =========================================================
   CAROUSEL BUILDER 
========================================================= */

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

  const cards = cardIds.map((id, i) => ({
    id,
    title: `Card ${i + 1}`,
    description: "",
    buttons: [{ id: buttonIds[i], title: `Button ${i + 1}` }],
  }));

  const baseX = sourceNode.position.x;
  const baseY = sourceNode.position.y;

  const carouselY = baseY + NODE_HEIGHT + VERTICAL_GAP;
  const cardY = carouselY + NODE_HEIGHT + VERTICAL_GAP;
  const buttonY = cardY + NODE_HEIGHT + VERTICAL_GAP;

  const totalWidth =
    cardIds.length * NODE_WIDTH + (cardIds.length - 1) * HORIZONTAL_GAP;

  const startX = baseX - totalWidth / 2 + NODE_WIDTH / 2;

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
  carouselNode.data.connected = true;

  const nodes = [carouselNode];
  const edges = [createEdge(sourceNodeId, carouselId, false, sourceHandle)];

  cards.forEach((card, index) => {
    const x = startX + index * (NODE_WIDTH + HORIZONTAL_GAP);
    const buttonId = card.buttons[0].id;

    const cardNode = createFlowNode({
      id: card.id,
      x,
      y: cardY,
      inPorts: [carouselId],
      outPorts: [buttonId],
      metaType: "carouselCard",
      title: card.title,
      groupId: carouselId,
      isValidDragConn: false,
      connected: true,
    });

    cardNode.data.buttons = card.buttons;
    cardNode.data.description = card.description;

    const buttonNode = createFlowNode({
      id: buttonId,
      x,
      y: buttonY,
      inPorts: [card.id],
      metaType: "carouselButton",
      title: card.buttons[0].title,
      groupId: carouselId,
      isValidDragConn: false,
    });

    nodes.push(cardNode, buttonNode);

    edges.push(createEdge(carouselId, card.id, true));
    edges.push(createEdge(card.id, buttonId, true));
  });

  return {
    nodesToAdd: nodes,
    edgesToAdd: edges,
    dataPatch: {
      [carouselId]: { type: "carousel", cards },
    },
    selectedNodeId: carouselId,
  };
}

/* =========================================================
   FORM BUILDER
========================================================= */

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
    metaType: "form",
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

  newNode.data.fields = nodeData.fields ?? [];

  return {
    nodesToAdd: [newNode],
    edgesToAdd: [createEdge(sourceNodeId, newNodeId, false, sourceHandle)],
    selectedNodeId: newNodeId,
  };
}

/* =========================================================
   MENU ACTION MAP 
========================================================= */

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
        type: "default",
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
        type: "delay",
        sourceHandle,
      }),

    jump: () =>
      buildSingleNodePayload({
        ...context,
        nodeData: templates.collectInput,
        getNextNodeId,
        type: "jump",
        sourceHandle,
      }),

    answer_ai: () =>
      buildSingleNodePayload({
        ...context,
        nodeData: templates.collectInput,
        getNextNodeId,
        type: "ai_answer",
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

/**
 * Returns updated node array after a new connection is made.
 * Pure function — no side effects.
 */
export function applyConnectionToNodes(nodes, params) {
  return nodes.map((node) => {
    if (node.id === params.source) {
      let updatedData = { ...node.data };
      if (params.sourceHandle === "success") {
        updatedData.successOutport = [
          ...(node.data.successOutport || []),
          params.target,
        ];
      } else if (params.sourceHandle === "failure") {
        updatedData.failureOutport = [
          ...(node.data.failureOutport || []),
          params.target,
        ];
      } else {
        updatedData.outPorts = [...(node.data.outPorts || []), params.target];
      }
      return { ...node, data: { ...updatedData, connected: true } };
    }
    if (node.id === params.target) {
      return {
        ...node,
        data: {
          ...node.data,
          inPorts: [...(node.data.inPorts || []), params.source],
          connected: true,
        },
      };
    }
    return node;
  });
}

/**
 * Returns true when connecting from sourceHandle on sourceId is still allowed
 * (no existing edge from the same source+handle pair).
 */
export function isConnectionAllowed(edges, source, sourceHandle) {
  return !edges.some(
    (e) => e.source === source && e.sourceHandle === sourceHandle,
  );
}
