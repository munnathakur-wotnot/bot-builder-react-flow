import { Icons } from "../context-menu/contextMenuConfig";

const NODE_WIDTH = 240;
const NODE_HEIGHT = 120;

const HORIZONTAL_GAP = 80;
const VERTICAL_GAP = 100;

/* =========================================================
   NODE TYPE RESOLUTION
   Maps data.type (metaType) → React Flow node type key
========================================================= */

const ACTION_META_TYPES = new Set(["start", "flowStart", "delay", "jump"]);
const SUBNODE_META_TYPES = new Set([
  "carouselCard",
  "carouselButton",
  "condition",
  "defaultCondition",
]);

/**
 * Given a node's metaType (data.type), returns the React Flow
 * nodeTypes key: "action" | "subnode" | "text"
 */
export function resolveNodeType(metaType) {
  if (ACTION_META_TYPES.has(metaType)) return "action";
  if (SUBNODE_META_TYPES.has(metaType)) return "subnode";
  return "text";
}

/* =========================================================
   CORE HELPERS
========================================================= */

export function createFlowNode({
  id,
  x,
  y,
  type,
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
  flowId = null,
}) {
  const node = {
    id,
    type: type ?? resolveNodeType(metaType),
    position: { x, y },
    flowId, // top-level — used by canvas filter, not inside data
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
      isErrorShow: false,
      isSearchHighlight: false,
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
  flowId = null,
) {
  const handle = sourceHandle || "default";

  return {
    id: `edge_${source}_${handle}_${target}`,
    source,
    target,
    hidden,
    sourceHandle: handle,
    type: "custom",
    flowId, // top-level — used by canvas filter
    data: { isNotDeletable },
  };
}

function getIncrementalTitle({ allNodes = [], metaType, baseTitle }) {
  const count = allNodes.filter((n) => n.data?.type === metaType).length;
  return count === 0 ? baseTitle : `${baseTitle} ${count + 1}`;
}

/* =========================================================
   NODE CONFIG ( MAIN IMPROVEMENT)
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
        _isJump: true,
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
  activeFlowId = null,
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
    flowId: activeFlowId,
  });

  const extraData = { ...config.extraData };
  // Jump nodes get a unique targetFlowId using their own node ID
  if (config.metaType === "jump") {
    extraData.targetFlowId = newNodeId;
    delete extraData._isJump;
  }

  newNode.data = {
    ...newNode.data,
    ...extraData,
  };

  return {
    nodesToAdd: [newNode],
    edgesToAdd: [
      createEdge(
        sourceNodeId,
        newNodeId,
        false,
        sourceHandle,
        undefined,
        activeFlowId,
      ),
    ],
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
  activeFlowId = null,
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
    flowId: activeFlowId,
  });

  carouselNode.data.cards = cards;
  carouselNode.data.outPorts = cardIds;
  carouselNode.data.connected = true;

  const nodes = [carouselNode];
  const edges = [
    createEdge(
      sourceNodeId,
      carouselId,
      false,
      sourceHandle,
      undefined,
      activeFlowId,
    ),
  ];

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
      flowId: activeFlowId,
    });

    cardNode.data.buttons = card.buttons;
    cardNode.data.description = card.description;
    cardNode.data.isSubNode = true;

    const buttonNode = createFlowNode({
      id: buttonId,
      x,
      y: buttonY,
      inPorts: [card.id],
      metaType: "carouselButton",
      title: card.buttons[0].title,
      groupId: carouselId,
      isValidDragConn: false,
      flowId: activeFlowId,
    });
    buttonNode.data.isSubNode = true;
    nodes.push(cardNode, buttonNode);

    edges.push(
      createEdge(carouselId, card.id, true, "", undefined, activeFlowId),
    );
    edges.push(
      createEdge(card.id, buttonId, true, "", undefined, activeFlowId),
    );
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
  activeFlowId = null,
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
    flowId: activeFlowId,
  });

  newNode.data.fields = nodeData.fields ?? [];

  return {
    nodesToAdd: [newNode],
    edgesToAdd: [
      createEdge(
        sourceNodeId,
        newNodeId,
        false,
        sourceHandle,
        undefined,
        activeFlowId,
      ),
    ],
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
  activeFlowId = null,
}) {
  return {
    carousel: () =>
      buildCarouselPayload({
        ...context,
        getNextNodeId,
        sourceHandle,
        activeFlowId,
      }),

    condition: () =>
      buildConditionPayload({
        ...context,
        getNextNodeId,
        sourceHandle,
        activeFlowId,
      }),

    collectInput: () =>
      buildSingleNodePayload({
        ...context,
        nodeData: templates.collectInput,
        getNextNodeId,
        type: "default",
        sourceHandle,
        activeFlowId,
      }),

    form: () =>
      buildFormPayload({
        ...context,
        nodeData: templates.form,
        getNextNodeId,
        sourceHandle,
        activeFlowId,
      }),

    delay: () =>
      buildSingleNodePayload({
        ...context,
        nodeData: templates.collectInput,
        getNextNodeId,
        type: "delay",
        sourceHandle,
        activeFlowId,
      }),

    jump: () =>
      buildSingleNodePayload({
        ...context,
        nodeData: templates.collectInput,
        getNextNodeId,
        type: "jump",
        sourceHandle,
        activeFlowId,
      }),

    answer_ai: () =>
      buildSingleNodePayload({
        ...context,
        nodeData: templates.collectInput,
        getNextNodeId,
        type: "ai_answer",
        sourceHandle,
        activeFlowId,
      }),

    flow: () =>
      buildFlowNodePayload({
        ...context,
        getNextNodeId,
        sourceHandle,
        activeFlowId,
      }),
  };
}

/* =========================================================
   FLOW NODE BUILDER
   Creates a "flow" node on the current canvas + auto-seeds a
   "Flow starts" trigger node inside the new sub-flow.
========================================================= */

export function buildFlowNodePayload({
  sourceNode,
  sourceNodeId,
  getNextNodeId,
  allNodes,
  sourceHandle = "",
  activeFlowId = null,
}) {
  const flowNodeId = getNextNodeId();
  const flowStartId = getNextNodeId();

  const title = getIncrementalTitle({
    allNodes,
    metaType: "flow",
    baseTitle: "Flow",
  });

  // The "flow" node visible on the current canvas scope
  const flowNode = createFlowNode({
    id: flowNodeId,
    x: sourceNode.position.x,
    y: sourceNode.position.y + 220,
    inPorts: [sourceNodeId],
    title,
    metaType: "flow",
    iCategory: "logic",
    flowId: activeFlowId,
  });
  flowNode.data.targetFlowId = flowNodeId; // sub-flow scope keyed by this node's ID

  // Auto-seeded "Flow starts" node inside the new sub-flow
  const flowStartNode = createFlowNode({
    id: flowStartId,
    x: 600,
    y: 200,
    title: `${title} - Flow starts`,
    metaType: "flowStart",
    iCategory: "logic",
    flowId: flowNodeId, // belongs to the new sub-flow
    connected: false,
  });

  return {
    nodesToAdd: [flowNode, flowStartNode],
    edgesToAdd: [
      createEdge(
        sourceNodeId,
        flowNodeId,
        false,
        sourceHandle,
        undefined,
        activeFlowId,
      ),
    ],
    selectedNodeId: flowNodeId,
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
  cardNode.data.isSubNode = true;
  nodesToAdd.push(cardNode);

  // New button node
  const newButton = createFlowNode({
    id: newButtonId,
    x: newCardX,
    isValidDragConn: false,
    y: buttonY,
    inPorts: [newCardId],
    metaType: "carouselButton",
    title: newCard.buttons[0].title,
    iCategory: "collect",
    groupId: selectedNodeId,
  });
  newButton.data.isSubNode = true;
  nodesToAdd.push(newButton);

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

//condition Node

export function buildConditionPayload({
  sourceNode,
  sourceNodeId,
  getNextNodeId,
  allNodes,
  sourceHandle = "",
  activeFlowId = null,
}) {
  const conditionRootId = getNextNodeId();

  const conditionTitle = getIncrementalTitle({
    allNodes,
    metaType: "conditionRoot",
    baseTitle: "Condition",
  });

  // Create children (1 default + 1 condition)
  const childIds = [getNextNodeId(), getNextNodeId(), getNextNodeId()];

  const children = [
    {
      id: childIds[1],
      title: "Branch 1",
      type: "condition",
    },
    {
      id: childIds[2],
      title: "Branch 2",
      type: "condition",
    },
    {
      id: childIds[0],
      title: "Default",
      type: "other", // default child
    },
  ];

  const baseX = sourceNode.position.x;
  const baseY = sourceNode.position.y;

  const rootY = baseY + NODE_HEIGHT + VERTICAL_GAP;
  const childY = rootY + NODE_HEIGHT + VERTICAL_GAP;

  const totalWidth =
    childIds.length * NODE_WIDTH + (childIds.length - 1) * HORIZONTAL_GAP;

  const startX = baseX - totalWidth / 2 + NODE_WIDTH / 2;

  // Root Node
  const rootNode = createFlowNode({
    id: conditionRootId,
    x: baseX,
    y: rootY,
    inPorts: [sourceNodeId],
    outPorts: childIds,
    title: conditionTitle,
    description: "Condition Node",
    metaType: "conditionRoot",
    iCategory: "logic",
    connected: true,
    flowId: activeFlowId,
  });

  rootNode.data.children = children;

  const nodes = [rootNode];
  const edges = [
    createEdge(
      sourceNodeId,
      conditionRootId,
      false,
      sourceHandle,
      undefined,
      activeFlowId,
    ),
  ];

  // Create only ONE LEVEL children
  children.forEach((child, index) => {
    const x = startX + index * (NODE_WIDTH + HORIZONTAL_GAP);

    const childNode = createFlowNode({
      id: child.id,
      x,
      y: childY,
      inPorts: [conditionRootId],
      metaType: child.type === "other" ? "defaultCondition" : "condition",
      title: child.title,
      groupId: conditionRootId,
      isValidDragConn: false,
      connected: true,
      flowId: activeFlowId,
    });
    childNode.data.conditionType = "ALL";
    childNode.data.conditions = [];
    childNode.data.isSubNode = true;

    nodes.push(childNode);

    edges.push(
      createEdge(conditionRootId, child.id, true, "", undefined, activeFlowId),
    );
  });

  return {
    nodesToAdd: nodes,
    edgesToAdd: edges,
    dataPatch: {
      [conditionRootId]: {
        type: "conditionRoot",
        children,
      },
    },
    selectedNodeId: conditionRootId,
  };
}

export function buildSingleBranch({
  selectedNodeId,
  conditionNode,
  allNodes = [],
  getNextNodeId,
}) {
  if (!conditionNode) return;

  const existingChildren = conditionNode.data?.children ?? [];

  const newChildId = getNextNodeId();

  const newChild = {
    id: newChildId,
    title: `Branch ${existingChildren.length}`,
    type: "condition",
  };

  const allChildren = [...existingChildren, newChild];

  const baseX = conditionNode.position.x;
  const rootY = conditionNode.position.y;

  const childY = rootY + NODE_HEIGHT + VERTICAL_GAP;

  // find last child node for positioning
  const existingChildNodes = existingChildren
    .map((c) => allNodes.find((n) => n.id === c.id))
    .filter(Boolean);

  const lastX =
    existingChildNodes.length > 0
      ? existingChildNodes[existingChildNodes.length - 1].position.x
      : baseX;

  const newX =
    existingChildNodes.length > 0 ? lastX + NODE_WIDTH + HORIZONTAL_GAP : baseX;

  /* =========================
     CREATE CHILD NODE
  ========================= */

  const childNode = createFlowNode({
    id: newChildId,
    x: newX,
    y: childY,
    inPorts: [selectedNodeId],
    metaType: "condition",
    title: newChild.title,
    groupId: selectedNodeId,
    isValidDragConn: false,
    connected: true,
  });

  childNode.data.conditionType = "ALL";
  childNode.data.conditions = [];
  childNode.data.isSubNode = true;

  /* =========================
     EDGE
  ========================= */

  const edge = createEdge(selectedNodeId, newChildId, true);

  return {
    nodesToAdd: [childNode],
    edgesToAdd: [edge],

    dataPatch: {
      [selectedNodeId]: {
        children: allChildren,
        outPorts: allChildren.map((c) => c.id),
      },
    },
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Reference-preserving merge helpers
   ─────────────────────────────────────────────────────────────────────────
   When a `flow-updated` socket event arrives, the incoming payload contains
   freshly-parsed JSON objects — so every node is a new object reference even
   when nothing about it changed.  Passing new references to React Flow causes
   it to re-render the wrapper AND the custom node component for every single
   node on the canvas, not just the one that actually changed.

   `nodesStructurallyEqual` compares only the fields that determine what a
   node renders.  When the fields are identical we return the EXISTING node
   object so React (and React Flow's internal NodeWrapper) sees the same
   reference → skips re-render entirely.
   ───────────────────────────────────────────────────────────────────────── */
// function shallowArrayEq(a, b) {
//   if (a === b) return true;
//   if (!a || !b || a.length !== b.length) return false;
//   for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
//   return true;
// }

// export function nodesStructurallyEqual(existing, incoming) {
//   // Position change → definitely different
//   if (
//     existing.position.x !== incoming.position.x ||
//     existing.position.y !== incoming.position.y
//   )
//     return false;

//   const a = existing.data;
//   const b = incoming.data;
//   if (a === b) return true;

//   // Scalar fields that affect rendering
//   if (
//     a.type !== b.type ||
//     a.title !== b.title ||
//     a.description !== b.description ||
//     a.icon !== b.icon ||
//     a.connected !== b.connected ||
//     a.delayDuration !== b.delayDuration ||
//     a.delayUnit !== b.delayUnit ||
//     a.doubleHandler !== b.doubleHandler ||
//     a.isErrorShow !== b.isErrorShow ||
//     a.knowledgeBaseId !== b.knowledgeBaseId ||
//     a.conditionType !== b.conditionType
//   )
//     return false;

//   // Array / object fields — JSON for correctness, short-circuit on length first
//   if (!shallowArrayEq(a.outPorts, b.outPorts)) return false;
//   if (!shallowArrayEq(a.inPorts, b.inPorts)) return false;
//   if (!shallowArrayEq(a.successOutport, b.successOutport)) return false;
//   if (!shallowArrayEq(a.failureOutport, b.failureOutport)) return false;
//   // cards / fields / children / conditions are less frequent — stringify only
//   // if the cheaper checks above all passed
//   if (JSON.stringify(a.cards) !== JSON.stringify(b.cards)) return false;
//   if (JSON.stringify(a.fields) !== JSON.stringify(b.fields)) return false;
//   if (JSON.stringify(a.children) !== JSON.stringify(b.children)) return false;
//   if (JSON.stringify(a.conditions) !== JSON.stringify(b.conditions))
//     return false;
//   if (JSON.stringify(a.functionIds) !== JSON.stringify(b.functionIds))
//     return false;

//   return true;
// }
