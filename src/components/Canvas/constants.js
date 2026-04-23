export const INITIAL_NODE_ID = "node_1";

export const INITIAL_NODES = [
  {
    id: INITIAL_NODE_ID,
    type: "custom",
    position: { x: 120, y: 120 },
    data: { id: INITIAL_NODE_ID },
  },
];

export const INITIAL_EDGES = [];

export const MENU_NODE_TEMPLATES = {
  collectInput: {
    type: "collectInput",
    title: "Name",
    description: "Please enter your name.",
  },
};
