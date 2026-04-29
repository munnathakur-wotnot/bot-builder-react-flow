import { SIDEBAR_CONFIGS } from "./sidebarConfigs";

const getComponets = (type) => SIDEBAR_CONFIGS[type];

export const CATEGORY_CONFIGS = {
  collectInput: {
    getComponets,
  },
  form: {
    getComponets,
  },
  carousel: {
    getComponets,
  },
};
