import { COLLECT_CONFIGS } from "./sidebarConfigs";
import { getCollectHandlers } from "../categories/collect/handlers";
import { getLogicHandlers } from "../categories/logic/handlers";
import { getAiHandlers } from "../categories/ai/handlers";
import { AI_CONFIGS } from "./aiConfigs";
import DurationSelector from "../categories/logic/DurationSelector";
import NodeSidebar from "../NodeSidebar";
import SmallSidebar from "../SmallSidebar";
import JumpSelector from "../categories/logic/JumpSelector";
import { LOGIC_CONFIG } from "./logicConfigs";

const SMALL_SIDEBAR_RENDER = {
  delay: DurationSelector,
  jump: JumpSelector,
};

const renderSmallSideBar = (props, type) => {
  function renderProps() {
    if (type === "delay") {
      return props;
    } else {
      return props;
    }
  }
  return {
    RenderCompoent: SMALL_SIDEBAR_RENDER[type],
    renderProps: renderProps(),
  };
};

export const CATEGORY_CONFIGS = {
  collect: {
    //get collect  components based on types
    getComponents: (type) => COLLECT_CONFIGS[type],
    //get collect handlers
    getHandlers: (props) => getCollectHandlers(props),
    getSidebarComponent: (_type, props) => ({ Component: NodeSidebar, props }),
  },
  logic: {
    getComponents: (type) => LOGIC_CONFIG[type],
    getHandlers: (props) => getLogicHandlers(props),
    getSidebarComponent: (type, props) =>
      type === "delay" || type === "jump"
        ? {
            Component: SmallSidebar,
            props: {
              selectedNode: props.selectedNode,
              updateNode: props.updateNode,
              nodes: props.nodes,
              renderComponent: (props) => renderSmallSideBar(props, type),
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
