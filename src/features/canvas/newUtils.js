import { Icons } from "../context-menu/contextMenuConfig";

const NODE_WIDTH = 240;
const NODE_HEIGHT = 120;
const HORIZONTAL_GAP = 80;
const VERTICAL_GAP = 100;

/* =========================================================
   NODE TYPE RESOLUTION
   metaType → React Flow node type key: "action" | "subnode" | "text"
========================================================= */

const ACTION_META_TYPES = new Set(["start", "flowStart", "delay", "jump"]);
const SUBNODE_META_TYPES = new Set([
  "carouselCard",
  "carouselButton",
  "condition",
  "defaultCondition",
]);

export function resolveNodeType(metaType) {
  if (ACTION_META_TYPES.has(metaType)) return "action";
  if (SUBNODE_META_TYPES.has(metaType)) return "subnode";
  return "text";
}

/* =========================================================
   CORE: createFlowNode

   Data structure:
     data.extras.config.{ title, description }  ← display fields
     data.metaType                               ← node category
     data.ports  [{ in: bool, name, links[] }]   ← connections
     data.connected                              ← has any links
     data.flowId                                 ← sub-flow scope
========================================================= */

const DEFAULT_PORTS = [
  { in: true, links: [], name: "top", type: "default" },
  { in: false, links: [], name: "bottom", type: "default" },
];

const DEFAULT_PORTS_AI_ANSWER = [
  { in: true, links: [], name: "top", type: "default" },
  { in: false, links: [], name: "bottomLeft", type: "default" },
  { in: false, links: [], name: "bottomRight", type: "default" },
];

function getDefaultPorts(metaType) {
  if (metaType === "ai_answer") {
    return structuredClone(DEFAULT_PORTS_AI_ANSWER);
  }

  return structuredClone(DEFAULT_PORTS);
}

export function createFlowNode({
  id,
  x,
  y,
  type,
  title = "",
  description = "",
  metaType = "",
  icon = "",
  ports,
  groupId,
  flowId = null,
}) {
  const node = {
    id,
    type: type ?? resolveNodeType(metaType),
    position: { x, y },
    data: {
      extras: {
        config: {
          title,
          description,
        },
      },
      type: metaType,

      // IMPORTANT
      ports: ports ?? getDefaultPorts(metaType),

      icon,
      flowId,
      isErrorShow: false,
      isSearchHighlight: false,
    },
  };

  if (groupId) {
    node.data.groupId = groupId;
  }

  return node;
}

/* =========================================================
   CORE: createEdge

   deletable: false  → locked sub-node edge (no delete button)
   deletable: true   → user-deletable flow edge
========================================================= */

export function createEdge({
  source,
  target,
  deletable = false,
  sourceHandle = "",
  hidden,
  flowId = null,
}) {
  const handle = sourceHandle || "bottom";

  return {
    id: `edge_${source}_${handle}_${target}`,
    source,
    target,
    hidden,
    deletable,
    sourceHandle: handle,
    type: "custom",
    data: { flowId },
  };
}

/* =========================================================
   PORT HELPERS

   Each port: { in: bool, name: string, links: string[] }
     in: true  → input port  (name: "top")
     in: false → output port (name: "bottom" | "bottomLeft" | "bottomRight")
     links     → connected node IDs
========================================================= */

export function getPortLinks(ports, isIn, name) {
  return ports?.find((p) => p.in === isIn && p.name === name)?.links ?? [];
}

export function setPortLinks(ports, isIn, name, links) {
  const arr = ports ?? [];
  const idx = arr.findIndex((p) => p.in === isIn && p.name === name);
  if (idx >= 0) {
    const updated = [...arr];
    updated[idx] = { ...updated[idx], links };
    return updated;
  }
  return [...arr, { in: isIn, name, links }];
}

/* =========================================================
   INTERNAL HELPERS
========================================================= */

function getIncrementalTitle({ allNodes = [], metaType, baseTitle }) {
  const count = allNodes.filter((n) => n.data?.metaType === metaType).length;
  return count === 0 ? baseTitle : `${baseTitle} ${count + 1}`;
}

function getNodeConfig(type, allNodes) {
  const configs = {
    delay: {
      nodeType: "action",
      metaType: "delay",
      baseTitle: "Delay",
      icon: "\u25D4",
      extraData: { delayDuration: 1 },
      extraPorts: [],
    },
    ai_answer: {
      nodeType: "text",
      metaType: "ai_answer",
      baseTitle: "Ai Answer",
      icon: "\uD83E\uDD16",
      description: "Ai Answer",
      extraData: { doubleHandler: true },
      // success + failure output ports for double-handler nodes
      extraPorts: [
        { in: false, name: "bottomLeft", links: [] },
        { in: false, name: "bottomRight", links: [] },
      ],
    },
    jump: {
      nodeType: "action",
      metaType: "jump",
      baseTitle: "Jump",
      icon: Icons.jump,
      extraData: { jumpNode: { id: "", title: "Select Node" } },
      extraPorts: [],
    },
    default: {
      nodeType: "text",
      metaType: "collectInput",
      baseTitle: "Enter Input",
      description: "Enter Description",
      extraData: {},
      extraPorts: [],
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
   SINGLE NODE BUILDER
========================================================= */

export function buildSingleNodePayload({
  sourceNode,
  sourceNodeId,
  getNextNodeId,
  allNodes,
  type = "default",
  sourceHandle = "",
  activeFlowId = null,
}) {
  const newNodeId = getNextNodeId();
  const config = getNodeConfig(type, allNodes);

  // Create node with default ports for its metaType
  const newNode = createFlowNode({
    id: newNodeId,
    type: config.nodeType,
    x: sourceNode.position.x,
    y: sourceNode.position.y + 220,
    title: config.title,
    description: config.description ?? "",
    metaType: config.metaType,
    icon: config.icon ?? "",
    flowId: activeFlowId,
  });

  // Create edge
  const edge = createEdge({
    source: sourceNodeId,
    target: newNodeId,
    deletable: true,
    sourceHandle,
    flowId: activeFlowId,
  });

  // Set input port links to source node
  newNode.data.ports = newNode.data.ports.map((port) => {
    if (port.in) {
      return { ...port, links: [sourceNodeId] };
    }
    return { ...port, links: [] };
  });

  const extraData = { ...config.extraData };

  // Jump nodes store their own ID as the target sub-flow
  if (config.metaType === "jump") {
    extraData.targetFlowId = newNodeId;
  }

  newNode.data = {
    ...newNode.data,
    ...extraData,
  };

  return {
    nodesToAdd: [newNode],
    edgesToAdd: [edge],
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
    custom_node_id: id,
    buttons: [
      {
        id: buttonIds[i],
        custom_node_id: buttonIds[i],
        title: `Button ${i + 1}`,
      },
    ],
  }));

  const baseX = sourceNode.position.x;
  const baseY = sourceNode.position.y;

  const carouselY = baseY + NODE_HEIGHT + VERTICAL_GAP;
  const cardY = carouselY + NODE_HEIGHT + VERTICAL_GAP;
  const buttonY = cardY + NODE_HEIGHT + VERTICAL_GAP;

  const totalWidth =
    cardIds.length * NODE_WIDTH + (cardIds.length - 1) * HORIZONTAL_GAP;

  const startX = baseX - totalWidth / 2 + NODE_WIDTH / 2;

  /*
   * Create parent edge first
   */
  const parentEdge = createEdge({
    source: sourceNodeId,
    target: carouselId,
    deletable: true,
    sourceHandle,
    flowId: activeFlowId,
  });

  /*
   * Create carousel node
   */
  const carouselNode = createFlowNode({
    id: carouselId,
    type: "text",
    x: baseX,
    y: carouselY,
    title: carouselTitle,
    description: "Carousel Node",
    metaType: "carousel",
    connected: true,
    flowId: activeFlowId,
    ports: [
      {
        in: true,
        name: "top",
        links: [sourceNodeId],
      },
      {
        in: false,
        name: "bottom",
        links: cardIds,
      },
    ],
  });

  carouselNode.data.extras.config.cardview = cards;

  const nodes = [carouselNode];
  const edges = [parentEdge];

  cards.forEach((card, index) => {
    const x = startX + index * (NODE_WIDTH + HORIZONTAL_GAP);

    const buttonId = card.buttons[0].id;

    /*
     * Create edges first
     */
    const cardEdge = createEdge({
      source: carouselId,
      target: card.id,
      flowId: activeFlowId,
    });

    const buttonEdge = createEdge({
      source: card.id,
      target: buttonId,
      flowId: activeFlowId,
    });

    /*
     * Card node
     */
    const cardNode = createFlowNode({
      id: card.id,
      type: "subnode",
      x,
      y: cardY,
      metaType: "carouselCard",
      title: card.title,
      groupId: carouselId,
      isValidDragConn: false,
      connected: true,
      flowId: activeFlowId,
      ports: [
        {
          in: true,
          name: "top",
          links: [carouselId],
        },
        {
          in: false,
          name: "bottom",
          links: [buttonId],
        },
      ],
    });

    cardNode.data.buttons = card.buttons;
    cardNode.data.extras.config.description = card.description;
    cardNode.data.isSubNode = true;

    /*
     * Button node
     */
    const buttonNode = createFlowNode({
      id: buttonId,
      type: "subnode",
      x,
      y: buttonY,
      metaType: "carouselButton",
      title: card.buttons[0].title,
      groupId: carouselId,
      isValidDragConn: false,
      connected: true,
      flowId: activeFlowId,
      ports: [
        {
          in: true,
          name: "top",
          links: [card.id],
        },
      ],
    });

    buttonNode.data.isSubNode = true;

    nodes.push(cardNode, buttonNode);

    edges.push(cardEdge);
    edges.push(buttonEdge);
  });

  return {
    nodesToAdd: nodes,
    edgesToAdd: edges,
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

  /*
   * Create edge first
   */
  const edge = createEdge({
    source: sourceNodeId,
    target: newNodeId,
    deletable: true,
    sourceHandle,
    flowId: activeFlowId,
  });

  /*
   * Create node
   */
  const newNode = createFlowNode({
    id: newNodeId,
    type: "text",
    x: sourceNode.position.x,
    y: sourceNode.position.y + 220,
    title,
    description: nodeData?.description ?? "",
    metaType: "form",
    connected: true,
    flowId: activeFlowId,
    ports: [
      {
        in: true,
        name: "top",
        links: [sourceNodeId],
      },
      {
        in: false,
        name: "bottom",
        links: [],
      },
    ],
  });

  newNode.data.fields = nodeData?.fields ?? [];

  return {
    nodesToAdd: [newNode],
    edgesToAdd: [edge],
    selectedNodeId: newNodeId,
  };
}

/* =========================================================
   FLOW NODE BUILDER
   Creates a "flow" node on the canvas + seeds a "flowStart"
   node inside the new sub-flow scope.
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

  /*
   * Create parent edge first
   */
  const edge = createEdge({
    source: sourceNodeId,
    target: flowNodeId,
    deletable: true,
    sourceHandle,
    flowId: activeFlowId,
  });

  /*
   * Flow node
   */
  const flowNode = createFlowNode({
    id: flowNodeId,
    type: "text",
    x: sourceNode.position.x,
    y: sourceNode.position.y + 220,
    title,
    metaType: "flow",
    connected: true,
    flowId: activeFlowId,
    ports: [
      {
        in: true,
        name: "top",
        links: [sourceNodeId],
      },
      {
        in: false,
        name: "bottom",
        links: [],
      },
    ],
  });

  flowNode.data.targetFlowId = flowNodeId;

  /*
   * Flow start node
   */
  const flowStartNode = createFlowNode({
    id: flowStartId,
    type: "action",
    x: 600,
    y: 200,
    title: `${title} - Flow starts`,
    metaType: "flowStart",
    connected: false,
    flowId: flowNodeId,
    ports: [
      {
        in: false,
        name: "bottom",
        links: [],
      },
    ],
  });

  return {
    nodesToAdd: [flowNode, flowStartNode],
    edgesToAdd: [edge],
    selectedNodeId: flowNodeId,
  };
}

/* =========================================================
   CONDITION BUILDER
========================================================= */

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

  const childIds = [getNextNodeId(), getNextNodeId(), getNextNodeId()];

  const children = [
    { id: childIds[1], title: "Branch 1", type: "condition" },
    { id: childIds[2], title: "Branch 2", type: "condition" },
    { id: childIds[0], title: "Default", type: "other" },
  ];

  const baseX = sourceNode.position.x;
  const baseY = sourceNode.position.y;

  const rootY = baseY + NODE_HEIGHT + VERTICAL_GAP;
  const childY = rootY + NODE_HEIGHT + VERTICAL_GAP;

  const totalWidth =
    childIds.length * NODE_WIDTH + (childIds.length - 1) * HORIZONTAL_GAP;

  const startX = baseX - totalWidth / 2 + NODE_WIDTH / 2;

  /*
   * Parent edge
   */
  const parentEdge = createEdge({
    source: sourceNodeId,
    target: conditionRootId,
    deletable: true,
    sourceHandle,
    flowId: activeFlowId,
  });

  /*
   * Root node
   */
  const rootNode = createFlowNode({
    id: conditionRootId,
    type: "text",
    x: baseX,
    y: rootY,
    title: conditionTitle,
    description: "Condition Node",
    metaType: "conditionRoot",
    connected: true,
    flowId: activeFlowId,
    ports: [
      {
        in: true,
        name: "top",
        links: [sourceNodeId],
      },
      {
        in: false,
        name: "bottom",
        links: childIds,
      },
    ],
  });

  rootNode.data.children = children;

  const nodes = [rootNode];
  const edges = [parentEdge];

  children.forEach((child, index) => {
    const x = startX + index * (NODE_WIDTH + HORIZONTAL_GAP);

    const childMetaType =
      child.type === "other" ? "defaultCondition" : "condition";

    /*
     * Child edge
     */
    const childEdge = createEdge({
      source: conditionRootId,
      target: child.id,
      flowId: activeFlowId,
    });

    /*
     * Child node
     */
    const childNode = createFlowNode({
      id: child.id,
      type: "subnode",
      x,
      y: childY,
      title: child.title,
      metaType: childMetaType,
      groupId: conditionRootId,
      isValidDragConn: false,
      connected: true,
      flowId: activeFlowId,
      ports: [
        {
          in: true,
          name: "top",
          links: [conditionRootId],
        },
      ],
    });

    childNode.data.conditionType = "ALL";
    childNode.data.conditions = [];
    childNode.data.isSubNode = true;

    nodes.push(childNode);
    edges.push(childEdge);
  });

  return {
    nodesToAdd: nodes,
    edgesToAdd: edges,
    selectedNodeId: conditionRootId,
  };
}

/* =========================================================
   ADD CAROUSEL CARD
========================================================= */

export function buildAddCarouselCardPayload({
  selectedNodeId,
  carouselNode,
  allNodes = [],
  getNextNodeId,
}) {
  const existingCards = (carouselNode?.data?.cards ?? []).map((card, index) => {
    if (typeof card === "string") {
      return { id: card, title: `Card ${index + 1}` };
    }

    return card;
  });

  const newCardId = getNextNodeId();
  const newButtonId = getNextNodeId();

  const newCard = {
    id: newCardId,
    title: `Card ${existingCards.length + 1}`,
    description: "",
    buttons: [
      {
        id: newButtonId,
        title: `Button ${existingCards.length + 1}`,
      },
    ],
  };

  const allCards = [...existingCards, newCard];

  const cardY = carouselNode.position.y + NODE_HEIGHT + VERTICAL_GAP;
  const buttonY = cardY + NODE_HEIGHT + VERTICAL_GAP;

  const existingCardNodes = existingCards
    .map((c) => allNodes.find((n) => n.id === c.id))
    .filter(Boolean);

  const lastCardX =
    existingCardNodes.length > 0
      ? existingCardNodes[existingCardNodes.length - 1].position.x
      : carouselNode.position.x;

  const newCardX =
    existingCards.length > 0
      ? lastCardX + NODE_WIDTH + HORIZONTAL_GAP
      : lastCardX;

  /*
   * Create edges first
   */
  const cardEdge = createEdge({
    source: selectedNodeId,
    target: newCardId,
  });

  const buttonEdge = createEdge({
    source: newCardId,
    target: newButtonId,
  });

  /*
   * Card node
   */
  const cardNode = createFlowNode({
    id: newCardId,
    type: "subnode",
    x: newCardX,
    y: cardY,
    metaType: "carouselCard",
    title: newCard.title,
    groupId: selectedNodeId,
    isValidDragConn: false,
    connected: true,
    ports: [
      {
        in: true,
        name: "top",
        links: [selectedNodeId],
      },
      {
        in: false,
        name: "bottom",
        links: [newButtonId],
      },
    ],
  });

  cardNode.data.buttons = newCard.buttons;
  cardNode.data.extras.config.description = newCard.description;
  cardNode.data.isSubNode = true;

  /*
   * Button node
   */
  const buttonNode = createFlowNode({
    id: newButtonId,
    type: "subnode",
    x: newCardX,
    y: buttonY,
    metaType: "carouselButton",
    title: newCard.buttons[0].title,
    groupId: selectedNodeId,
    isValidDragConn: false,
    connected: true,
    ports: [
      {
        in: true,
        name: "top",
        links: [newCardId],
      },
    ],
  });

  buttonNode.data.isSubNode = true;

  /*
   * Update carousel output links
   */
  const updatedCarouselPorts = setPortLinks(
    carouselNode.data.ports ?? [],
    false,
    "bottom",
    allCards.map((c) => c.id),
  );

  return {
    nodesToAdd: [cardNode, buttonNode],
    edgesToAdd: [cardEdge, buttonEdge],
    dataPatch: {
      [selectedNodeId]: {
        cards: allCards,
        ports: updatedCarouselPorts,
      },
    },
  };
}

/* =========================================================
   ADD CONDITION BRANCH
========================================================= */

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

  const rootY = conditionNode.position.y;
  const childY = rootY + NODE_HEIGHT + VERTICAL_GAP;

  const existingChildNodes = existingChildren
    .map((c) => allNodes.find((n) => n.id === c.id))
    .filter(Boolean);

  const lastX =
    existingChildNodes.length > 0
      ? existingChildNodes[existingChildNodes.length - 1].position.x
      : conditionNode.position.x;

  const newX =
    existingChildNodes.length > 0 ? lastX + NODE_WIDTH + HORIZONTAL_GAP : lastX;

  /*
   * Create edge first
   */
  const edge = createEdge({
    source: selectedNodeId,
    target: newChildId,
  });

  /*
   * Child node
   */
  const childNode = createFlowNode({
    id: newChildId,
    type: "subnode",
    x: newX,
    y: childY,
    title: newChild.title,
    metaType: "condition",
    groupId: selectedNodeId,
    isValidDragConn: false,
    connected: true,
    ports: [
      {
        in: true,
        name: "top",
        links: [selectedNodeId],
      },
    ],
  });

  childNode.data.conditionType = "ALL";
  childNode.data.conditions = [];
  childNode.data.isSubNode = true;

  /*
   * Update root output ports
   */
  const updatedRootPorts = setPortLinks(
    conditionNode.data.ports ?? [],
    false,
    "bottom",
    allChildren.map((c) => c.id),
  );

  return {
    nodesToAdd: [childNode],
    edgesToAdd: [edge],
    dataPatch: {
      [selectedNodeId]: {
        children: allChildren,
        ports: updatedRootPorts,
      },
    },
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
        getNextNodeId,
        type: "delay",
        sourceHandle,
        activeFlowId,
      }),

    jump: () =>
      buildSingleNodePayload({
        ...context,
        getNextNodeId,
        type: "jump",
        sourceHandle,
        activeFlowId,
      }),

    answer_ai: () =>
      buildSingleNodePayload({
        ...context,
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
   CONNECTION HELPERS
========================================================= */

/**
 * Returns updated nodes after a new edge connection is made.
 * Updates source node's output port links and target node's input port links.
 */
export function applyConnectionToNodes(nodes, params) {
  const sourceHandle = params.sourceHandle || "bottom";
  return nodes.map((node) => {
    if (node.id === params.source) {
      const updatedPorts = node.data.ports?.map((port) => {
        if (!port.in && port.name === sourceHandle) {
          const links = Array.isArray(port.links) ? port.links : [];
          return {
            ...port,
            links: links.includes(params.target) ? links : [...links, params.target],
          };
        }
        return port;
      });
      return { ...node, data: { ...node.data, ports: updatedPorts } };
    }
    if (node.id === params.target) {
      const updatedPorts = node.data.ports?.map((port) => {
        if (port.in) {
          const links = Array.isArray(port.links) ? port.links : [];
          return {
            ...port,
            links: links.includes(params.source) ? links : [...links, params.source],
          };
        }
        return port;
      });
      return { ...node, data: { ...node.data, ports: updatedPorts } };
    }
    return node;
  });
}

/**
 * Returns updated nodes after edges are removed.
 * Removes the corresponding node IDs from each port's links.
 */
export function removeNodeConnectionsForEdges(nodes, edgesToRemove) {
  if (!Array.isArray(edgesToRemove) || edgesToRemove.length === 0) {
    return nodes;
  }

  // Build per-node removal sets using edge source/target node IDs
  const removalsMap = new Map();
  const getEntry = (nodeId) => {
    if (!removalsMap.has(nodeId)) {
      removalsMap.set(nodeId, { output: new Set(), input: new Set() });
    }
    return removalsMap.get(nodeId);
  };

  for (const edge of edgesToRemove) {
    getEntry(edge.source).output.add(edge.target);
    getEntry(edge.target).input.add(edge.source);
  }

  return nodes.map((node) => {
    if (!node?.data?.ports) return node;

    const removal = removalsMap.get(node.id);
    if (!removal) return node;

    const updatedPorts = node.data.ports.map((port) => {
      if (!Array.isArray(port.links)) return port;
      const removeSet = port.in ? removal.input : removal.output;
      if (removeSet.size === 0) return port;
      const newLinks = port.links.filter((id) => !removeSet.has(id));
      return newLinks.length !== port.links.length ? { ...port, links: newLinks } : port;
    });

    return { ...node, data: { ...node.data, ports: updatedPorts } };
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
