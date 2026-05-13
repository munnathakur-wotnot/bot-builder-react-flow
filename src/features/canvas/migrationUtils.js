/**
 * migrationUtils.js
 *
 * Two-way migration between the legacy port-based JSON format and the
 * current React-Flow node/edge format used by Canvas.jsx + utils.js.
 *
 *  importMigration(oldJson)          → { nodes, edges }
 *  exportMigration(nodes, edges, meta) → oldJson
 */

import { resolveNodeType } from "./newUtils";

/* =========================================================
   CONSTANTS & MAPS
========================================================= */

/** Old dialogType  →  new metaType (data.type) */
const DIALOG_TYPE_TO_META_TYPE = {
  trigger: "start",
  input: "collectInput",
  cardview: "carousel",
  faq: "ai_answer",
  form: "form",
  flow: "flow",
  flow_start: "flowStart",
  jump_to: "jump",
  delay: "delay",
  branch: "conditionRoot",
  file: "file",
  buttons: "buttons",
};

/** new metaType  →  old dialogType */
const META_TYPE_TO_DIALOG_TYPE = Object.fromEntries(
  Object.entries(DIALOG_TYPE_TO_META_TYPE).map(([k, v]) => [v, k]),
);
// Sub-node overrides
META_TYPE_TO_DIALOG_TYPE.carouselCard = "custom";
META_TYPE_TO_DIALOG_TYPE.carouselButton = "custom";
META_TYPE_TO_DIALOG_TYPE.condition = "custom";
META_TYPE_TO_DIALOG_TYPE.defaultCondition = "custom";
META_TYPE_TO_DIALOG_TYPE.conditionRoot = "branch";

/** Icons used when converting old → new */
const META_TYPE_ICONS = {
  start: "🚀",
  collectInput: "💬",
  carousel: "🎠",
  ai_answer: "🤖",
  form: "📋",
  flow: "🔀",
  flowStart: "▶️",
  jump: "⤵️",
  file: "📁",
  buttons: "🔘",
  delay: "◔",
  conditionRoot: "⑂",
  condition: "↗",
  defaultCondition: "↗",
};

const META_TYPE_CATEGORY = {
  start: "trigger",
  collectInput: "collect",
  carousel: "collect",
  carouselCard: "collect",
  carouselButton: "collect",
  ai_answer: "ai",
  form: "collect",
  flow: "logic",
  flowStart: "logic",
  jump: "logic",
  file: "collect",
  buttons: "collect",
  delay: "logic",
  conditionRoot: "logic",
  condition: "logic",
  defaultCondition: "logic",
};

/* =========================================================
     HELPERS
  ========================================================= */

/** RFC-4122 v4 UUID */
function genId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * Given an old node's port list and a port name pattern, returns the port id.
 * portName can be "top" | "bottom" | "bottomLeft" | "bottomRight"
 */
function findPortId(ports, portName) {
  return ports.find((p) => p.name === portName)?.id ?? null;
}

/* =========================================================
     IMPORT  (old JSON  →  { nodes, edges })
  ========================================================= */

/**
 * Converts legacy port-based JSON into React-Flow node + edge arrays.
 *
 * Data preservation strategy
 * ──────────────────────────
 * All fields from extras.config that are NOT explicitly mapped to a
 * canonical new-format key are kept verbatim inside data._legacy so
 * exportMigration can round-trip them without loss.
 *
 * @param {object} oldJson  Root of the old JSON (has .nodes and .links)
 * @returns {{ nodes: object[], edges: object[] }}
 */
export function importMigration(oldJson) {
  const t0 = performance.now();
  const { nodes: oldNodes = [], links: oldLinks = [] } = oldJson;

  console.log(oldJson, "Hello-old-json");

  /* ── 0. Pre-pass: map condition child IDs → metaType & data ─ */
  // Scan branch (conditionRoot) nodes to know which children are
  // "condition" vs "defaultCondition" and capture their condition data.
  const conditionChildTypeMap = new Map(); // nodeId → "condition"|"defaultCondition"
  const conditionChildDataMap = new Map(); // nodeId → { conditionType, conditions }
  for (const node of oldNodes) {
    if (node.dialogType !== "branch") continue;
    for (const branch of node.extras?.config?.branch ?? []) {
      const childId = branch.custom_node_id;
      if (!childId) continue;
      conditionChildTypeMap.set(
        childId,
        branch.type === "default" ? "defaultCondition" : "condition",
      );
      conditionChildDataMap.set(childId, {
        conditionType: branch.operator === "any" ? "ANY" : "ALL",
        conditions: branch.conditions ?? [],
      });
    }
  }

  /* ── 1. Build portId → { nodeId, portName, isIn } ─────────── */
  const portMap = new Map(); // portId → { nodeId, portName, isIn }
  for (const node of oldNodes) {
    for (const port of node.ports ?? []) {
      portMap.set(port.id, {
        nodeId: node.id,
        portName: port.name,
        isIn: port.in,
      });
    }
  }

  /* ── 2. Accumulate connections per node ────────────────────── */
  const acc = new Map(); // nodeId → { inPorts, outPorts, successOutport, failureOutport }
  for (const node of oldNodes) {
    acc.set(node.id, {
      inPorts: [],
      outPorts: [],
      successOutport: [],
      failureOutport: [],
    });
  }

  /* ── 3. Convert links → edges, populate acc ───────────────── */
  const newEdges = [];
  for (const link of oldLinks) {
    const srcPort = portMap.get(link.sourcePort);
    const tgtPort = portMap.get(link.targetPort);
    if (!srcPort || !tgtPort) continue;

    const sourceNodeId = link.source;
    const targetNodeId = link.target;

    // Determine React-Flow sourceHandle from old port name
    let sourceHandle = "default";
    if (srcPort.portName === "bottomLeft") sourceHandle = "success";
    else if (srcPort.portName === "bottomRight") sourceHandle = "failure";

    const srcAcc = acc.get(sourceNodeId);
    const tgtAcc = acc.get(targetNodeId);

    if (srcAcc) {
      if (sourceHandle === "success") {
        srcAcc.successOutport.push(targetNodeId);
      } else if (sourceHandle === "failure") {
        srcAcc.failureOutport.push(targetNodeId);
      } else {
        srcAcc.outPorts.push(targetNodeId);
      }
    }
    if (tgtAcc) {
      tgtAcc.inPorts.push(sourceNodeId);
    }

    newEdges.push({
      id: `edge_${sourceNodeId}_${sourceHandle}_${targetNodeId}`,
      source: sourceNodeId,
      target: targetNodeId,
      sourceHandle,
      type: "custom",
      flowId: link.flowId ?? null,
      data: { isNotDeletable: !link.isDeleteable },
    });
  }

  /* ── 4. Convert nodes ─────────────────────────────────────── */
  const newNodes = [];
  for (const oldNode of oldNodes) {
    const config = oldNode.extras?.config ?? {};
    const dialogType = oldNode.dialogType ?? "";
    const { inPorts, outPorts, successOutport, failureOutport } =
      acc.get(oldNode.id) ?? {};

    /* Resolve metaType */
    let metaType = DIALOG_TYPE_TO_META_TYPE[dialogType] ?? dialogType;
    if (dialogType === "custom") {
      if (config.parentType === "cardview") metaType = "carouselCard";
      else if (config.parentType === "cardview_branch")
        metaType = "carouselButton";
      else if (config.parentType === "branch")
        // Use the pre-built map so type is exact (condition vs defaultCondition)
        metaType = conditionChildTypeMap.get(oldNode.id) ?? "condition";
      else metaType = "custom";
    }

    const isConnected =
      (inPorts?.length ?? 0) > 0 ||
      (outPorts?.length ?? 0) > 0 ||
      (successOutport?.length ?? 0) > 0 ||
      (failureOutport?.length ?? 0) > 0;

    /* Base node */
    const newNode = {
      id: oldNode.id,
      type: resolveNodeType(metaType),
      position: { x: oldNode.x, y: oldNode.y },
      flowId: oldNode.flowId ?? null,
      data: {
        id: oldNode.id,
        extras: {
          config: {
            title: config.title ?? "",
            description:
              config.content ??
              config.text ??
              config.plain_text ??
              config.description ??
              "",
          },
        },
        metaType,
        icon: META_TYPE_ICONS[metaType] ?? "",
        iCategory: META_TYPE_CATEGORY[metaType] ?? "",
        inPorts: inPorts ?? [],
        outPorts: outPorts ?? [],
        connected: isConnected,
        isErrorShow: false,
        isSearchHighlight: false,
        // Round-trip bucket – keeps all unmapped config fields intact
        _legacy: config,
      },
    };

    /* ── Type-specific data ──────────────────────────────────── */
    switch (metaType) {
      case "start":
        newNode.data.triggerConditions = config.trigger_conditions ?? [];
        newNode.data.extraVariables = config.extra_variables ?? [];
        newNode.data.messageAPIAddress = config.messageAPIAddress ?? "";
        newNode.data.startConversationAPIAddress =
          config.startConversationAPIAddress ?? "";
        break;

      case "collectInput":
        newNode.data.text =
          config.text ?? config.content ?? config.plain_text ?? "";
        newNode.data.buttons = config.buttons ?? [];
        newNode.data.parameter = config.parameter ?? "";
        newNode.data.parameterLabel = config.parameter_label ?? "";
        newNode.data.version = config.version ?? 1;
        break;

      case "carousel": {
        /*
         * Old cardview[] entry shape:
         *   { value, item_title, content, text, file,
         *     source_port, custom_node_id,          ← card sub-node id
         *     buttons[]: { value, btn_text, source_port, custom_node_id } }
         */
        const cardviewArr = config.cardview ?? [];
        const cards = cardviewArr.map((card) => ({
          id: card.custom_node_id ?? card.value,
          title: card.item_title ?? "",
          description: card.content ?? card.text ?? "",
          file: card.file ?? { name: "", path: "", size: "", type: "" },
          buttons: (card.buttons ?? []).map((btn) => ({
            id: btn.custom_node_id ?? btn.value,
            title: btn.btn_text ?? btn.btn_content ?? "",
            action: btn.action ?? { label: "branch", value: "branch" },
            url: btn.url ?? { link: "", target: "new" },
            buttonPayload: btn.button_payload ?? {
              source: "",
              content: "",
              plain_text: "",
            },
          })),
        }));
        newNode.data.cards = cards;
        // outPorts for carousel = card sub-node IDs (already in outPorts from links,
        // but cards may be disconnected; ensure we list them)
        const cardIds = cards.map((c) => c.id);
        newNode.data.outPorts = cardIds.length ? cardIds : (outPorts ?? []);
        newNode.data.connected = true;
        newNode.data.parameter = config.parameter ?? "";
        newNode.data.parameterLabel = config.parameter_label ?? "";
        break;
      }

      case "carouselCard":
        newNode.data.isSubNode = true;
        newNode.data.groupId = inPorts?.[0] ?? null; // parent carousel id
        // Button titles will be back-filled after all nodes are processed
        newNode.data.buttons = (outPorts ?? []).map((btnId) => ({
          id: btnId,
          title: "",
        }));
        break;

      case "carouselButton":
        newNode.data.isSubNode = true;
        // grandparent = carousel; parent = card
        newNode.data.groupId = null; // filled in post-processing
        break;

      case "ai_answer":
        newNode.data.doubleHandler = true;
        newNode.data.successOutport = successOutport ?? [];
        newNode.data.failureOutport = failureOutport ?? [];
        newNode.data.persona =
          config.persona?.plain_text ?? config.persona ?? "";
        newNode.data.question =
          config.question?.plain_text ?? config.question ?? "";
        newNode.data.modelName = config.model_name ?? "gpt-4o";
        newNode.data.knowledgeBaseId = config.knowledge_base_id ?? null;
        newNode.data.functionIds = (config.functions ?? []).map(
          (f) => f?.id ?? f,
        );
        newNode.data.topK = config.top_k ?? 1;
        newNode.data.restrictAnswerSize = config.restrict_answer_size ?? "256";
        newNode.data.creativityInResponse =
          config.creativity_in_response ?? "0.5";
        newNode.data.isFeedbackEnabled = config.is_feedback_enabled ?? false;
        break;

      case "form":
        newNode.data.text =
          config.text ?? config.content ?? config.plain_text ?? "";
        newNode.data.fields = config.form_fields ?? [];
        newNode.data.messageInfo = config.message_info ?? {};
        newNode.data.version = config.version ?? 1;
        break;

      case "flow":
        // flowId of the flow-start node inside the sub-flow = flow_start_id
        newNode.data.targetFlowId = config.flow_start_id ?? oldNode.id;
        newNode.data.flowStartId = config.flow_start_id ?? null;
        break;

      case "flowStart":
        // flowStart node "owns" its own sub-flow scope → flowId = its own id
        newNode.flowId = oldNode.id;
        newNode.data.parentNodeId = config.parentNodeID ?? null;
        break;

      case "jump":
        newNode.data.jumpNode = config.selected_block
          ? {
              id: config.selected_block.value,
              title: config.selected_block.label,
              dialogType: config.selected_block.dialogType ?? "",
            }
          : { id: "", title: "Select Node" };
        newNode.data._isJump = true;
        break;

      case "delay":
        newNode.data.delayDuration =
          config.delay_time?.value ??
          config.delay_duration ??
          config.delayDuration ??
          1;
        newNode.data.delayUnit = config.delay_time?.unit ?? "seconds";
        break;

      case "conditionRoot": {
        // Rebuild children list from the branch[] array in config
        const branchArr = config.branch ?? [];
        const childIds = branchArr.map((b) => b.custom_node_id).filter(Boolean);
        newNode.data.children = branchArr.map((b) => ({
          id: b.custom_node_id,
          type: b.type === "default" ? "defaultCondition" : "condition",
          title: "", // back-filled in post-processing
        }));
        // Prefer branch-config order; fall back to accumulated outPorts
        newNode.data.outPorts = childIds.length ? childIds : (outPorts ?? []);
        newNode.data.connected = true;
        break;
      }

      case "condition":
      case "defaultCondition": {
        newNode.data.isSubNode = true;
        newNode.data.groupId = inPorts?.[0] ?? null; // parent conditionRoot id
        const condData = conditionChildDataMap.get(oldNode.id);
        newNode.data.conditionType = condData?.conditionType ?? "ALL";
        newNode.data.conditions = condData?.conditions ?? [];
        break;
      }

      default:
        break;
    }

    newNodes.push(newNode);
  }

  /* ── 5. Post-processing: fix sub-node back-references ─────── */
  // Build O(1) lookup map to avoid nested O(n) .find() calls
  const nodeMap = new Map(newNodes.map((n) => [n.id, n]));

  for (const node of newNodes) {
    if (node.data.metaType === "carousel") {
      for (const card of node.data.cards ?? []) {
        const cardNode = nodeMap.get(card.id);
        if (cardNode) {
          cardNode.data.extras.config.title = card.title;
          cardNode.data.extras.config.description = card.description;
          cardNode.data.groupId = node.id;
          cardNode.data.buttons = card.buttons;

          for (const btn of card.buttons ?? []) {
            const btnNode = nodeMap.get(btn.id);
            if (btnNode) {
              btnNode.data.extras.config.title = btn.title;
              btnNode.data.groupId = node.id; // carousel is the group owner
            }
          }
        }
      }
    }

    if (node.data.metaType === "conditionRoot") {
      for (const child of node.data.children ?? []) {
        const childNode = nodeMap.get(child.id);
        if (childNode) child.title = childNode.data.extras?.config?.title ?? "";
      }
    }
  }

  const t1 = performance.now();
  console.debug(
    `[importMigration] ${newNodes.length} nodes, ${newEdges.length} edges — ${(t1 - t0).toFixed(1)}ms`,
  );

  console.log(newNodes, newEdges, "Hello New");

  return { nodes: newNodes, edges: newEdges };
}

/* =========================================================
     EXPORT  ({ nodes, edges }  →  old JSON)
  ========================================================= */

/**
 * Converts current React-Flow node + edge arrays back to the legacy JSON.
 *
 * Port IDs are freshly generated (UUIDs) every export – the receiver only
 * cares that sourcePort / targetPort match within the same document.
 *
 * All fields stored in data._legacy are spread back into extras.config so
 * nothing is lost during a round-trip.
 *
 * @param {object[]} nodes
 * @param {object[]} edges
 * @param {object}   [meta]   Extra metadata to embed (e.g. extraInfo counts)
 * @returns {object}  Legacy JSON root object
 */
export function exportMigration(nodes, edges, meta = {}) {
  /* ── 1. Generate port IDs for every node ─────────────────── */
  /*
   * Each node gets one "in" port (top) and one or two "out" ports:
   *   - normal nodes  → one "bottom" port
   *   - ai_answer     → "bottomLeft" (success) + "bottomRight" (failure)
   */
  const portBook = new Map(); // nodeId → { inPortId, outPortId, successPortId, failurePortId }

  for (const node of nodes) {
    const metaType = node.data?.type ?? "";
    const entry = {};

    const isStartNode = metaType === "start" || metaType === "flowStart";
    if (!isStartNode) entry.inPortId = genId();

    if (metaType === "ai_answer") {
      entry.successPortId = genId(); // bottomLeft
      entry.failurePortId = genId(); // bottomRight
    } else {
      entry.outPortId = genId();
    }

    portBook.set(node.id, entry);
  }

  /* ── 2. Convert edges → links ────────────────────────────── */
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const oldLinks = [];

  for (const edge of edges) {
    const srcPorts = portBook.get(edge.source) ?? {};
    const tgtPorts = portBook.get(edge.target) ?? {};

    let sourcePortId;
    if (edge.sourceHandle === "success") sourcePortId = srcPorts.successPortId;
    else if (edge.sourceHandle === "failure")
      sourcePortId = srcPorts.failurePortId;
    else sourcePortId = srcPorts.outPortId;

    const targetPortId = tgtPorts.inPortId;

    // Approximate midpoints for the points array (kept for visual fidelity)
    const src = nodeById.get(edge.source);
    const tgt = nodeById.get(edge.target);
    const x1 = (src?.position?.x ?? 0) + 120;
    const y1 = (src?.position?.y ?? 0) + 120;
    const x2 = (tgt?.position?.x ?? 0) + 120;
    const y2 = tgt?.position?.y ?? 0;

    oldLinks.push({
      id: genId(),
      type: "advanced",
      color: "rgba(255,255,255,0.5)",
      width: 3,
      extras: {},
      flowId: edge.flowId ?? "",
      labels: [],
      points: [
        { x: x1, y: y1, id: genId(), selected: false },
        { x: x2, y: y2, id: genId(), selected: false },
      ],
      source: edge.source,
      target: edge.target,
      selected: false,
      curvyness: 50,
      sourcePort: sourcePortId ?? "",
      targetPort: targetPortId ?? "",
      isDeleteable: !edge.data?.isNotDeletable,
    });
  }

  /* ── 3. Build portId → linkId[] map (for port.links arrays) ─ */
  const portLinkMap = new Map(); // portId → string[]
  for (const link of oldLinks) {
    for (const pid of [link.sourcePort, link.targetPort]) {
      if (!pid) continue;
      if (!portLinkMap.has(pid)) portLinkMap.set(pid, []);
      portLinkMap.get(pid).push(link.id);
    }
  }

  /* ── 4. Convert nodes ────────────────────────────────────── */
  const oldNodes = [];

  for (const node of nodes) {
    const d = node.data ?? {};
    const metaType = d.metaType ?? d.type ?? "";
    const dialogType = META_TYPE_TO_DIALOG_TYPE[metaType] ?? metaType;
    const legacy = d._legacy ?? {};
    const ports = portBook.get(node.id) ?? {};

    /* Build ports array */
    const portsArr = [];

    if (ports.inPortId) {
      portsArr.push({
        id: ports.inPortId,
        in: true,
        name: "top",
        type: "default",
        label: " ",
        links: portLinkMap.get(ports.inPortId) ?? [],
        selected: false,
        parentNode: node.id,
        maximumLinks: 1,
      });
    }

    if (metaType === "ai_answer") {
      portsArr.push({
        id: ports.successPortId,
        in: false,
        name: "bottomLeft",
        type: "default",
        label: " ",
        links: portLinkMap.get(ports.successPortId) ?? [],
        selected: false,
        parentNode: node.id,
        maximumLinks: 1,
      });
      portsArr.push({
        id: ports.failurePortId,
        in: false,
        name: "bottomRight",
        type: "default",
        label: " ",
        links: portLinkMap.get(ports.failurePortId) ?? [],
        selected: false,
        parentNode: node.id,
        maximumLinks: 1,
      });
    } else if (ports.outPortId) {
      portsArr.push({
        id: ports.outPortId,
        in: false,
        name: "bottom",
        type: "default",
        label: " ",
        links: portLinkMap.get(ports.outPortId) ?? [],
        selected: false,
        parentNode: node.id,
        maximumLinks: 1,
      });
    }

    /* Build extras.config ─────────────────────────────────────
     * Strategy: start from _legacy (all original fields), then
     * overlay the canonical fields that may have changed in the UI.
     */
    let config = {
      ...legacy,
      title: d.extras?.config?.title ?? d.title ?? "",
      dialog_type: dialogType,
      is_supported: true,
      is_valid_dialog_title: true,
    };

    switch (metaType) {
      case "start":
        config = {
          ...config,
          trigger_conditions:
            d.triggerConditions ?? legacy.trigger_conditions ?? [],
          extra_variables: d.extraVariables ?? legacy.extra_variables ?? [],
          messageAPIAddress:
            d.messageAPIAddress ?? legacy.messageAPIAddress ?? "",
          startConversationAPIAddress:
            d.startConversationAPIAddress ??
            legacy.startConversationAPIAddress ??
            "",
        };
        break;

      case "collectInput": {
        const textVal = d.text ?? "";
        config = {
          ...config,
          text: textVal,
          content: textVal,
          plain_text: textVal,
          buttons: d.buttons ?? legacy.buttons ?? [],
          parameter: d.parameter ?? "",
          parameter_label: d.parameterLabel ?? "",
          version: d.version ?? legacy.version ?? 1,
        };
        break;
      }

      case "carousel": {
        /* Rebuild old cardview[] from data.cards */
        const cardviewArr = (d.cards ?? []).map((card) => ({
          value: card.id,
          item_title: card.title ?? "",
          content: card.description ?? "",
          text: card.description ?? "",
          plain_text: card.description ?? "",
          file: card.file ?? { name: "", path: "", size: "", type: "" },
          source_port: "", // port of the corresponding card sub-node (not tracked in new format)
          custom_node_id: card.id,
          is_valid_content: true,
          is_valid_item_title: true,
          buttons: (card.buttons ?? []).map((btn) => ({
            value: genId(),
            btn_text: btn.title ?? "",
            btn_content: btn.title ?? "",
            source_port: "",
            custom_node_id: btn.id,
            action: btn.action ?? { label: "branch", value: "branch" },
            url: btn.url ?? { link: "", target: "new" },
            button_payload: btn.buttonPayload ?? {
              source: "",
              content: "",
              plain_text: "",
            },
            is_valid_input_url: true,
            is_valid_button_text: true,
          })),
        }));

        config = {
          ...config,
          type: "cardview",
          cardview: cardviewArr,
          parameter: d.parameter ?? "",
          parameter_label: d.parameterLabel ?? "",
          free_input_enabled: legacy.free_input_enabled ?? false,
          link_tracking_enabled: legacy.link_tracking_enabled ?? false,
          button_payload_response_variable:
            legacy.button_payload_response_variable ?? "",
        };
        break;
      }

      case "carouselCard":
        config = {
          text: d.extras?.config?.description ?? d.description ?? "",
          title: d.extras?.config?.title ?? d.title ?? "",
          parentType: "cardview",
          dialog_type: "custom",
          is_supported: true,
          is_valid_dialog_title: true,
        };
        break;

      case "carouselButton":
        config = {
          text: "",
          title: d.extras?.config?.title ?? d.title ?? "",
          parentType: "cardview_branch",
          dialog_type: "custom",
          is_supported: true,
          is_valid_dialog_title: true,
        };
        break;

      case "ai_answer": {
        const personaText = d.persona ?? "";
        const questionText = d.question ?? "";
        config = {
          ...config,
          top_k: d.topK ?? legacy.top_k ?? 1,
          persona: {
            source: personaText,
            content: personaText,
            plain_text: personaText,
          },
          question: {
            source: questionText,
            content: questionText,
            plain_text: questionText,
          },
          functions: (d.functionIds ?? []).map((id) =>
            typeof id === "string" ? { id } : id,
          ),
          model_name: d.modelName ?? legacy.model_name ?? "gpt-4o",
          knowledge_base_id: d.knowledgeBaseId ?? null,
          display_as_file: legacy.display_as_file ?? false,
          display_as_list: legacy.display_as_list ?? false,
          display_as_buttons: legacy.display_as_buttons ?? false,
          display_as_carousel: legacy.display_as_carousel ?? false,
          is_feedback_enabled:
            d.isFeedbackEnabled ?? legacy.is_feedback_enabled ?? false,
          restrict_answer_size:
            d.restrictAnswerSize ?? legacy.restrict_answer_size ?? "256",
          creativity_in_response:
            d.creativityInResponse ?? legacy.creativity_in_response ?? "0.5",
          is_chat_history_enabled: legacy.is_chat_history_enabled ?? false,
          context_of_conversations: legacy.context_of_conversations ?? 1,
          is_answer_contain_source: legacy.is_answer_contain_source ?? false,
          message_info: legacy.message_info ?? {
            is_enabled: false,
            is_disabled: false,
            title_source: "",
            title_content: "",
            is_valid_title: true,
            title_plain_text: "",
            description_source: "",
            description_content: "",
            description_plain_text: "",
          },
        };
        break;
      }

      case "form": {
        const formText = d.text ?? "";
        config = {
          ...config,
          text: formText,
          content: formText,
          plain_text: formText,
          version: d.version ?? legacy.version ?? 2,
          form_fields: d.fields ?? legacy.form_fields ?? [],
          message_info: d.messageInfo ??
            legacy.message_info ?? {
              is_enabled: false,
              is_disabled: false,
              title_source: "",
              title_content: "",
              is_valid_title: true,
              title_plain_text: "",
              description_source: "",
              description_content: "",
              description_plain_text: "",
            },
          link_tracking_enabled: legacy.link_tracking_enabled ?? false,
          is_valid_message_input: legacy.is_valid_message_input ?? true,
        };
        break;
      }

      case "flow":
        config = {
          ...config,
          flow_start_id:
            d.flowStartId ?? d.targetFlowId ?? legacy.flow_start_id ?? null,
        };
        break;

      case "flowStart":
        config = {
          ...config,
          parentNodeID: d.parentNodeId ?? legacy.parentNodeID ?? null,
        };
        break;

      case "jump": {
        const jn = d.jumpNode ?? {};
        config = {
          ...config,
          selected_block: jn.id
            ? {
                label: jn.title ?? "",
                value: jn.id,
                dialogType: jn.dialogType ?? "input",
              }
            : null,
          is_selected_block_empty: !jn.id,
          is_valid_dialog_title: true,
        };
        break;
      }

      case "delay":
        config = {
          ...config,
          id: node.id,
          dialog_type: "delay",
          version: legacy.version ?? 1,
          delay_time: {
            unit: d.delayUnit ?? legacy.delay_time?.unit ?? "seconds",
            label: `${d.delayDuration ?? 1}${(d.delayUnit ?? legacy.delay_time?.unit ?? "seconds").charAt(0)}`,
            value: d.delayDuration ?? 1,
          },
          delay_duration: d.delayDuration ?? 1,
        };
        break;

      case "conditionRoot": {
        // Rebuild the branch[] from the condition children stored on this node
        const branchArr = (d.children ?? []).map((child) => {
          const childNode = nodeById.get(child.id);
          const cd = childNode?.data ?? {};
          return {
            type: child.type === "defaultCondition" ? "default" : "normal",
            operator: cd.conditionType === "ANY" ? "any" : "all",
            conditions: cd.conditions ?? [],
            is_accessed: false,
            source_port: "",
            custom_node_id: child.id,
          };
        });
        config = {
          ...config,
          dialog_type: "branch",
          branch: branchArr,
        };
        break;
      }

      case "condition":
        config = {
          text: "",
          title: d.extras?.config?.title ?? d.title ?? "",
          parentType: "branch",
          dialog_type: "custom",
          is_supported: true,
          is_valid_dialog_title: true,
        };
        break;

      case "defaultCondition":
        config = {
          text: "",
          title: d.extras?.config?.title ?? d.title ?? "",
          parentType: "branch",
          dialog_type: "custom",
          is_supported: true,
          is_valid_dialog_title: true,
        };
        break;

      default:
        break;
    }

    oldNodes.push({
      x: node.position?.x ?? 0,
      y: node.position?.y ?? 0,
      id: node.id,
      type: "text",
      ports: portsArr,
      extras: { config },
      flowId: node.flowId ?? node.id,
      dormant: false,
      offsetX: "",
      offsetY: "",
      selected: false,
      dialogType,
      infoBlocks: [],
      referencedAtJumpto: [],
    });
  }

  /* ── 5. Assemble legacy root object ──────────────────────── */
  return {
    id: genId(),
    zoom: 100,
    links: oldLinks,
    nodes: oldNodes,
    offsetX: meta.offsetX ?? 583,
    offsetY: meta.offsetY ?? 151,
    version: 2,
    gridSize: 0,
    extraInfo: meta.extraInfo ?? {},
    hotKeyword: meta.hotKeyword ?? [],
    isCompressedView: false,
    outboundDelayFlow: meta.outboundDelayFlow ?? {},
    outboundEmailFlow: meta.outboundEmailFlow ?? {},
    isAccountConfigured: meta.isAccountConfigured ?? {
      google: false,
      hubspot: false,
      zendesk: false,
      airtable: false,
      calendly: false,
      zoho_crm: false,
      freshdesk: false,
      salesforce: false,
      slack_live_chat: false,
      google_analytics: false,
      zendesk_live_chat: false,
      slack_notification: false,
    },
    deployedOutboundDelayFlow: meta.deployedOutboundDelayFlow ?? {},
    deployedOutboundEmailFlow: meta.deployedOutboundEmailFlow ?? {},
  };
}
