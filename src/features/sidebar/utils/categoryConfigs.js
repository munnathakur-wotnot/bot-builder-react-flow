import { COLLECT_CONFIGS } from "./sidebarConfigs";
import { getCollectHandlers } from "../categories/collect/handlers";
import { getLogicHandlers } from "../categories/logic/handlers";
import { getAiHandlers } from "../categories/ai/handlers";
import { AI_CONFIGS } from "./aiConfigs";
import DurationSelector from "../categories/logic/DurationSelector";
import NodeSidebar from "../NodeSidebar";

export const CATEGORY_CONFIGS = {
  collect: {
    getComponents: (type) => COLLECT_CONFIGS[type],
    getHandlers: (props) => getCollectHandlers(props),
    getSidebarComponent: (_type, props) => ({ Component: NodeSidebar, props }),
  },
  logic: {
    getComponents: () => null,
    getHandlers: (props) => getLogicHandlers(props),
    getSidebarComponent: (type, props) =>
      type === "delay"
        ? { Component: DurationSelector, props: { selectedNode: props.selectedNode, updateNode: props.updateNode } }
        : { Component: NodeSidebar, props },
  },
  ai: {
    getComponents: (type) => AI_CONFIGS[type],
    getHandlers: (props) => getAiHandlers(props),
    getSidebarComponent: (_type, props) => ({ Component: NodeSidebar, props }),
  },
  integrations: {
    getComponents: () => null,
    getHandlers: () => ({}),
    getSidebarComponent: (_type, props) => ({ Component: NodeSidebar, props }),
  },
};
