/**
 * Returns an array of error strings for the given node.
 * Returns [] if the node is valid or should be skipped.
 */
/**
 * Returns an array of error KEYS for the given node.
 * Example: ["title", "description"]
 */
export function validateNodeKeys(node, allNodes, callFrom = "") {
  const d = callFrom === "sidebar" ? node : node?.data;
  if (!d) return [];

  const type = d.type;

  // Ignore start node and carousel sub-nodes
  if (type === "start" || d.isSubNode) return [];

  const errorKeys = [];

  // ── Common: title ──────────────────
  if (!d.title?.trim()) errorKeys.push("title");

  // ── Common: description ────────────
  const noDescTypes = ["delay", "jump", "conditionRoot"];
  if (!noDescTypes.includes(type) && !d.description?.trim()) {
    errorKeys.push("description");
  }

  // ── Per-type ───────────────────────
  if (type === "form") {
    const fields = d.fields ?? [];
    if (fields.length === 0) {
      errorKeys.push("fields");
    } else if (fields.some((f) => !f.label?.trim())) {
      const errors = {};
      fields.forEach((items) => {
        if (!items.label.trim()) {
          errors[items.id] = true;
        }
      });

      errorKeys.push({ fields_label: errors });
    }
  }

  if (type === "carousel") {
    const cards = d.cards ?? [];

    if (cards.length === 0) {
      errorKeys.push("cards");
    } else {
      if (cards.some((c) => !c.title?.trim())) {
        const errors = {};
        cards.forEach((items) => {
          if (!items.title.trim()) {
            errors[items.id] = true;
          }
        });
        errorKeys.push({ cards_title: errors });
      }

      if (
        cards.some(
          (c) => !c.buttons?.length || c.buttons.some((b) => !b.title?.trim()),
        )
      ) {
        let errors = {};
        cards.forEach((item) => {
          let id = item.id;
          item?.buttons?.forEach((items) => {
            if (!items.title.trim()) {
              errors[id] = true;
            }
          });
        });

        errorKeys.push({ cards_buttons_title: errors });
      }
    }
  }

  if (type === "ai_answer") {
    // if (!d.question?.trim()) errorKeys.push("question");
    // if (!d.prompt?.trim()) errorKeys.push("prompt");
    if (!d.knowledgeBaseId) errorKeys.push("knowledgeBaseId");
    if (!d.functionIds?.length) errorKeys.push("functionIds");
  }

  if (type === "delay") {
    if (!d.delayDuration) errorKeys.push("delayDuration");
  }

  if (type === "jump") {
    if (!d.jumpNode?.id) errorKeys.push("jumpNode");
  }

  // if (type === "conditionRoot") {
  //   const branches = (allNodes ?? []).filter(
  //     (n) => n.data?.groupId === node.id,
  //   );

  //   if (branches.length === 0) {
  //     errorKeys.push("branches");
  //   } else if (branches.some((b) => !b.data?.conditions?.length)) {
  //     errorKeys.push("branches.conditions");
  //   }
  // }

  return errorKeys;
}

/**
 * Returns a plain object { nodeId: string[] } for every invalid node.
 */
export function validateAllNodesKeys(input, callFrom) {
  const nodes = Array.isArray(input) ? input : [input];
  const result = {};

  for (const node of nodes) {
    const keys = validateNodeKeys(node, nodes, callFrom);
    if (keys.length > 0) {
      result[node.id] = keys;
    }
  }

  return result;
}
