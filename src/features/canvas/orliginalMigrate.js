import {
  convertFromReactFlowEdge,
  convertToReactFlowEdge,
} from "./newMigrationEdges";
import {
  convertFromReactFlowNode,
  convertToReactFlowNode,
} from "./newMigrationNodes";

/**
 * OLD FLOW -> REACT FLOW
 */
export function migrateToReactFlow(oldFlow) {
  return {
    ...oldFlow,

    // links -> edges
    edges: (oldFlow.links || []).map(convertToReactFlowEdge),

    // nodes
    nodes: (oldFlow.nodes || []).map(convertToReactFlowNode),

    // viewport
    viewport: {
      x: oldFlow.offsetX || 0,
      y: oldFlow.offsetY || 0,
      zoom: (oldFlow.zoom || 100) / 100,
    },

    // cleanup old keys
    links: undefined,
    offsetX: undefined,
    offsetY: undefined,
    zoom: undefined,
  };
}

/**
 * REACT FLOW -> OLD FLOW
 */
export function migrateFromReactFlow(rfFlow) {
  return {
    ...rfFlow,

    // edges -> links
    links: (rfFlow.edges || []).map(convertFromReactFlowEdge),

    // nodes
    nodes: (rfFlow.nodes || []).map(convertFromReactFlowNode),

    // viewport -> old structure
    offsetX: rfFlow.viewport?.x || 0,
    offsetY: rfFlow.viewport?.y || 0,

    zoom: Math.round((rfFlow.viewport?.zoom || 1) * 100),

    // cleanup RF keys
    edges: undefined,
    viewport: undefined,
  };
}
