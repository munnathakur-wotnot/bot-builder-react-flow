const REACT_FLOW_NODE_KEYS = new Set([
  "id",
  "type",
  "position",
  "data",

  "selected",
  "dragging",
  "draggable",
  "selectable",
  "deletable",
  "connectable",
  "focusable",

  "width",
  "height",

  "zIndex",

  "isConnectable",

  "sourcePosition",
  "targetPosition",

  "dragHandle",

  "parentId",
  "extent",
  "expandParent",

  "hidden",

  "draggingHandle",

  "measured",

  "resizing",

  "origin",

  "ariaLabel",
]);

const MAPPINGTYPENODE = {
  trigger: "action",
  input: "text",
  cardview: "text",
  custom: "subnode",
  form: "text",
  faq: "text", //ai-answer
  delay: "action",
  branch: "text",
  jump_to: "action",
};

const DIALOG_TYPE_TO_META_TYPE = {
  trigger: "start",
  input: "collectInput",
  cardview: "carousel",
  faq: "ai_answer",
  form: "form",
  flow: "flow",
  flow_start: "flowStart",
  jump_to: "jump",
  delay: "delay",
  branch: "conditionRoot",
  file: "file",
  buttons: "buttons",
};

export function convertToReactFlowNode(oldNode) {
  const rfNode = {
    id: oldNode.id,

    // dialogType -> RF type
    type: MAPPINGTYPENODE[oldNode.dialogType] || oldNode.type,

    // x,y -> position
    position: {
      x: oldNode.x ?? 0,
      y: oldNode.y ?? 0,
    },
  };

  // copy RF-supported keys directly
  REACT_FLOW_NODE_KEYS.forEach((key) => {
    if (
      oldNode[key] !== undefined &&
      !["id", "type", "position", "data"].includes(key)
    ) {
      rfNode[key] = oldNode[key];
    }
  });

  // remaining custom keys -> data
  const data = {
    // preserve original old node type
    originalType: oldNode.type,
  };

  Object.entries(oldNode).forEach(([key, value]) => {
    // skip mapped keys
    if (["id", "x", "y", "dialogType"].includes(key)) {
      return;
    }

    // old type moved into data
    if (key === "type") {
      data.oldType = value;
      data.type = DIALOG_TYPE_TO_META_TYPE[oldNode.dialogType];
      data.oldType = oldNode.dialogType;
      return;
    }

    // skip RF native keys
    if (REACT_FLOW_NODE_KEYS.has(key)) {
      return;
    }

    data[key] = value;
  });

  rfNode.data = data;

  return rfNode;
}

export function convertFromReactFlowNode(rfNode) {
  const oldNode = {
    id: rfNode.id,

    // Restore original dialogType (stored as data.oldType during import)
    dialogType: rfNode.data?.oldType ?? rfNode.type,

    // Restore original node type (e.g. "text") stored as data.originalType
    type: rfNode.data?.originalType ?? "text",

    x: rfNode.position?.x ?? 0,
    y: rfNode.position?.y ?? 0,
  };

  // restore RF-supported keys
  REACT_FLOW_NODE_KEYS.forEach((key) => {
    if (
      rfNode[key] !== undefined &&
      !["id", "type", "position", "data"].includes(key)
    ) {
      oldNode[key] = rfNode[key];
    }
  });

  // restore data — skip reconstruction-only artifacts
  if (rfNode.data) {
    Object.entries(rfNode.data).forEach(([key, value]) => {
      if (["type", "originalType", "oldType"].includes(key)) return;
      oldNode[key] = value;
    });
  }

  return oldNode;
}
