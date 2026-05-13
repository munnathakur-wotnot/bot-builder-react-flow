export function createFlowNode({
  id,
  x,
  y,
  type,
  connected = false,
  title = "",
  description = "",
  metaType = "",
  icon = "",
  ports = [],
  groupId,
  flowId = null,
}) {
  const node = {
    id,
    type: type,
    position: { x, y },
    data: {
      extras: {
        config: {
          title,
          description,
        },
      },
      metaType: metaType,
      connected,
      ports,
      icon,
      flowId,
    },
  };

  if (groupId) node.groupId = groupId;

  return node;
}

export function createEdge({
  source,
  target,
  deletable = false,
  sourceHandle = "",
  hidden,
  flowId = null,
}) {
  const handle = sourceHandle || "default";

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
