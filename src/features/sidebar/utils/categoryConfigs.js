import { COLLECT_CONFIGS } from "./sidebarConfigs";
import { getCollectHandlers } from "../categories/collect/handlers";
import { getLogicHandlers } from "../categories/logic/handlers";
import { getAiHandlers } from "../categories/ai/handlers";
import { AI_CONFIGS } from "./aiConfigs";
import DurationSelector from "../categories/logic/DurationSelector";
import NodeSidebar from "../NodeSidebar";
import SmallSidebar from "../SmallSidebar";
import JumpSelector from "../categories/logic/JumpSelector";
import FlowSelector from "../categories/logic/FlowSelector";
import { LOGIC_CONFIG } from "./logicConfigs";

const SMALL_SIDEBAR_RENDER = {
  delay: DurationSelector,
  jump: JumpSelector,
  flow: FlowSelector,
};

const renderSmallSideBar = (props, type) => {
  return {
    RenderCompoent: SMALL_SIDEBAR_RENDER[type],
    renderProps: props,
  };
};

export const CATEGORY_CONFIGS = {
  collect: {
    getComponents: (type) => COLLECT_CONFIGS[type],
    getHandlers: (props) => getCollectHandlers(props),
    getSidebarComponent: (_type, props) => ({ Component: NodeSidebar, props }),
  },
  logic: {
    getComponents: (type) => LOGIC_CONFIG[type],
    getHandlers: (props) => getLogicHandlers(props),
    getSidebarComponent: (type, props) =>
      type === "delay" || type === "jump" || type === "flow"
        ? {
            Component: SmallSidebar,
            props: {
              selectedNode: props.selectedNode,
              updateNode: props.updateNode,
              nodes: props.nodes,
              onEnterFlow: props.onEnterFlow,
              renderComponent: (p) => renderSmallSideBar(p, type),
            },
          }
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
