import { SIDEBAR_CONFIGS } from "./sidebarConfigs";
import { getCollectHandlers } from "../categories/collect/handlers";
import { getLogicHandlers } from "../categories/logic/handlers";
import DurationSelector from "../categories/logic/DurationSelector";
import NodeSidebar from "../NodeSidebar";

export const CATEGORY_CONFIGS = {
  collect: {
    getComponents: (type) => SIDEBAR_CONFIGS[type],
    getHandlers: (props) => getCollectHandlers(props),
    getSidebarComponent: () => NodeSidebar,
  },
  logic: {
    getComponents: () => null,
    getHandlers: (props) => getLogicHandlers(props),
    getSidebarComponent: (type) =>
      type === "delay" ? DurationSelector : NodeSidebar,
  },
  ai: {
    getComponents: () => null,
    getHandlers: () => ({}),
    getSidebarComponent: () => NodeSidebar,
  },
  integrations: {
    getComponents: () => null,
    getHandlers: () => ({}),
    getSidebarComponent: () => NodeSidebar,
  },
};
