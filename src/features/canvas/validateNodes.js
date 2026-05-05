/**
 * Returns an array of error strings for the given node.
 * Returns [] if the node is valid or should be skipped.
 */
export function validateNode(node, allNodes) {
  const d = node?.data;
  if (!d) return [];

  const type = d.type;

  // Ignore start node and carousel sub-nodes
  if (type === "start" || d.isSubNode) return [];

  const errors = [];

  // ── Common: title required on every real node ──────────────────
  if (!d.title?.trim()) errors.push("Title is required");

  // ── Common: description required (except layout/logic-only nodes) ──
  const noDescTypes = ["delay", "jump", "conditionRoot", "carousel"];
  if (!noDescTypes.includes(type) && !d.description?.trim()) {
    errors.push("Description is required");
  }

  // ── Per-type ───────────────────────────────────────────────────
  if (type === "form") {
    const fields = d.fields ?? [];
    if (fields.length === 0) {
      errors.push("At least one field is required");
    } else if (fields.some((f) => !f.label?.trim())) {
      errors.push("All fields must have a label");
    }
  }

  if (type === "carousel") {
    const cards = d.cards ?? [];
    if (cards.length === 0) {
      errors.push("At least one card is required");
    } else {
      if (cards.some((c) => !c.title?.trim()))
        errors.push("All cards must have a title");
      if (
        cards.some(
          (c) =>
            !c.buttons?.length || c.buttons.some((b) => !b.title?.trim()),
        )
      )
        errors.push("All buttons must have a title");
    }
  }

  if (type === "ai_answer") {
    if (!d.question?.trim()) errors.push("Question is required");
    if (!d.prompt?.trim()) errors.push("Prompt is required");
    if (!d.knowledgeBaseId) errors.push("Knowledge base is required");
    if (!d.functionIds?.length) errors.push("At least one function is required");
  }

  if (type === "delay") {
    if (!d.delayDuration) errors.push("Delay duration is required");
  }

  if (type === "jump") {
    if (!d.jumpNode?.id) errors.push("Jump target is required");
  }

  if (type === "conditionRoot") {
    const branches = (allNodes ?? []).filter(
      (n) => n.data?.groupId === node.id,
    );
    if (branches.length === 0) {
      errors.push("At least one branch is required");
    } else if (branches.some((b) => !b.data?.conditions?.length)) {
      errors.push("All branches must have at least one condition");
    }
  }

  return errors;
}

/**
 * Returns a plain object { nodeId: string[] } for every invalid node.
 */
export function validateAllNodes(nodes) {
  const result = {};
  for (const node of nodes) {
    const errs = validateNode(node, nodes);
    if (errs.length > 0) result[node.id] = errs;
  }
  return result;
}
