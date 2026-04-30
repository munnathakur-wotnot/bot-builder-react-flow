import dagre from "@dagrejs/dagre";

const DEFAULT_NODE_WIDTH = 240;
const DEFAULT_NODE_HEIGHT = 120;
const DEFAULT_LAYOUT_OPTIONS = {
  direction: "TB",
  nodeSep: 170,
  rankSep: 180,
  marginX: 80,
  marginY: 80,
};

export function layoutNodesDagre(nodes, edges, options = {}) {
  const { direction, nodeSep, rankSep, marginX, marginY } = {
    ...DEFAULT_LAYOUT_OPTIONS,
    ...options,
  };

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSep,
    ranksep: rankSep,
    marginx: marginX,
    marginy: marginY,
    ranker: "tight-tree",
  });

  for (const n of nodes) {
    const width = n.style?.width || n.width || 240;
    const height = n.style?.height || n.height || 120;
    g.setNode(n.id, { width, height });
  }

  for (const e of edges) {
    if (!e?.source || !e?.target) continue;
    g.setEdge(e.source, e.target);
  }

  dagre.layout(g);

  return nodes.map((n) => {
    const { x, y, width, height } = g.node(n.id) ?? {};
    if (typeof x !== "number" || typeof y !== "number") return n;
    if (typeof x !== "number" || typeof y !== "number") return n;

    // Dagre gives center coordinates; ReactFlow expects top-left.
    const w = width ?? DEFAULT_NODE_WIDTH;
    const h = height ?? DEFAULT_NODE_HEIGHT;

    return {
      ...n,
      position: { x: x - w / 2, y: y - h / 2 },
    };
  });
}

export function buildLaidOutGraph(nodes, edges, options = {}) {
  return {
    nodes: layoutNodesDagre(nodes, edges, options),
    edges,
  };
}
