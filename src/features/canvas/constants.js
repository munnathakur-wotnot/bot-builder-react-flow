export const INITIAL_NODE_ID = "node_1";

export const INITIAL_NODES = [
  {
    id: INITIAL_NODE_ID,
    type: "custom",
    position: { x: 120, y: 120 },
    width: 220,
    height: 120,
    data: {
      id: INITIAL_NODE_ID,
      inPorts: [],
      outPorts: [],
      connected: false,
      title: "Start",
      description: "description",
      type: "start",
    },
  },
];

export const INITIAL_EDGES = [];

export const DEFAULT_FORM_FIELDS = [
  { id: "field_name", label: "Name", type: "text" },
  { id: "field_email", label: "Email", type: "email" },
  { id: "field_phone", label: "Phone", type: "tel" },
];

export const MENU_NODE_TEMPLATES = {
  collectInput: {
    type: "collectInput",
    title: "Collect Input",
    description: "Please enter your input.",
    inPorts: [],
    outPorts: [],
    connected: false,
  },
  form: {
    type: "form",
    title: "Form",
    description: "Fill in the form below.",
    fields: DEFAULT_FORM_FIELDS,
    inPorts: [],
    outPorts: [],
    connected: false,
  },
};
