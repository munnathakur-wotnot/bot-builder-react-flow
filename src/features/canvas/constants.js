export const INITIAL_NODE_ID = "node_1";

/** Collab UI fields that must never be persisted or copied/cloned */
export const EPHEMERAL_NODE_KEYS = [
  "isDraggedBy",
  "isDraggedByColor",
  "isMenuOpenBy",
  "isMenuOpenByColor",
  "isSearchHighlight",
  "selectedBy",
  "selectedByColor",
];

export const INITIAL_NODES = [
  {
    id: INITIAL_NODE_ID,
    type: "custom",
    position: { x: 120, y: 120 },
    deletable: false,
    selectable: false,
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

export const initialNodes = [
  // GROUP NODE
  {
    id: "group-1",
    type: "group",
    position: { x: 100, y: 100 },

    style: {
      width: 500,
      height: 300,
      background: "#161616",
      border: "2px solid #444",
      borderRadius: 20,
      padding: 10,
    },

    data: {
      label: "Sub Flow",
    },
  },

  // CHILD NODE 1
  {
    id: "1",
    parentId: "group-1",
    extent: "parent",

    position: { x: 40, y: 60 },

    data: {
      label: "Start",
    },

    style: {
      background: "#0f172a",
      color: "#fff",
      border: "1px solid #334155",
      padding: 10,
      borderRadius: 12,
      width: 120,
    },
  },

  // CHILD NODE 2
  {
    id: "2",
    parentId: "group-1",
    extent: "parent",

    position: { x: 250, y: 60 },

    data: {
      label: "Process",
    },

    style: {
      background: "#1e293b",
      color: "#fff",
      border: "1px solid #475569",
      padding: 10,
      borderRadius: 12,
      width: 140,
    },
  },

  // CHILD NODE 3
  {
    id: "3",
    parentId: "group-1",
    extent: "parent",

    position: { x: 160, y: 180 },

    data: {
      label: "End",
    },

    style: {
      background: "#111827",
      color: "#fff",
      border: "1px solid #6b7280",
      padding: 10,
      borderRadius: 12,
      width: 120,
    },
  },
];

export const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,

    style: {
      stroke: "#999",
      strokeWidth: 2,
    },
  },

  {
    id: "e2-3",
    source: "2",
    target: "3",

    style: {
      stroke: "#999",
      strokeWidth: 2,
    },
  },
];

export const INITIAL_NODE_ID_LOCAL = 2;
