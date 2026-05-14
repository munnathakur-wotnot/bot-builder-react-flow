const REACT_FLOW_EDGE_KEYS = new Set([
  "id",
  "source",
  "target",
  "type",
  "animated",
  "selected",
  "deletable",
  "style",
  "markerEnd",
  "markerStart",
  "interactionWidth",
  "label",
  "labelStyle",
  "labelShowBg",
  "labelBgStyle",
  "labelBgPadding",
  "labelBgBorderRadius",
]);

export function convertToReactFlowEdge(oldEdge) {
  const mappedEdge = {
    id: oldEdge.id,
    type: oldEdge.type,

    source: oldEdge.source,
    target: oldEdge.target,

    deletable: oldEdge.isDeleteable,
  };

  // copy direct RF-supported keys if present
  REACT_FLOW_EDGE_KEYS.forEach((key) => {
    if (oldEdge[key] !== undefined) {
      mappedEdge[key] = oldEdge[key];
    }
  });

  // remaining custom keys -> data
  const data = {
    // move handles into data
    sourceHandle: oldEdge.sourcePort,
    targetHandle: oldEdge.targetPort,
  };

  Object.entries(oldEdge).forEach(([key, value]) => {
    // skip already mapped keys
    if (
      [
        "id",
        "type",
        "source",
        "target",
        "sourcePort",
        "targetPort",
        "isDeleteable",
      ].includes(key)
    ) {
      return;
    }

    // skip RF native keys
    if (REACT_FLOW_EDGE_KEYS.has(key)) {
      return;
    }

    data[key] = value;
  });

  mappedEdge.data = data;

  return mappedEdge;
}

export function convertFromReactFlowEdge(rfEdge) {
  const oldEdge = {
    id: rfEdge.id,
    type: rfEdge.type,

    source: rfEdge.source,
    target: rfEdge.target,

    // restore from data
    sourcePort: rfEdge.data?.sourceHandle,
    targetPort: rfEdge.data?.targetHandle,

    isDeleteable: rfEdge.deletable,
  };

  // restore RF keys
  REACT_FLOW_EDGE_KEYS.forEach((key) => {
    if (
      rfEdge[key] !== undefined &&
      !["id", "type", "source", "target", "deletable"].includes(key)
    ) {
      oldEdge[key] = rfEdge[key];
    }
  });

  // restore custom data
  if (rfEdge.data) {
    Object.entries(rfEdge.data).forEach(([key, value]) => {
      // skip handled values
      if (["sourceHandle", "targetHandle"].includes(key)) {
        return;
      }

      oldEdge[key] = value;
    });
  }

  return oldEdge;
}
