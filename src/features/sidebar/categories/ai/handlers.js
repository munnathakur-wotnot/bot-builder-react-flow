import useDebouncedCallback from "../../../../shared/hooks/useDebouncedCallback";

// Note: this module exports a factory, not a hook,
// so it must NOT call any React hooks internally.
// The debouncer is created outside and passed in.
export function getAiHandlers({ updateNode, nodeData }) {
  const kbs  = nodeData?.knowledgeBases    ?? [];
  const fns  = nodeData?.availableFunctions ?? [];
  const fnIds = nodeData?.functionIds       ?? [];
  const kbId  = nodeData?.knowledgeBaseId   ?? null;

  return {
    ai: {
      /* ── text fields ── */
      setQuestion: (value) => updateNode({ question: value }),
      setPrompt:   (value) => updateNode({ prompt: value }),

      /* ── KB ── */
      selectKb: (id) => updateNode({ knowledgeBaseId: id }),
      createKb: () => {
        const id = `kb_${Date.now()}`;
        updateNode({ knowledgeBases: [...kbs, { id, name: "Untitled", model: "gpt-4o" }] });
        return id;
      },
      saveKb: (updated) =>
        updateNode({ knowledgeBases: kbs.map((k) => k.id === updated.id ? updated : k) }),
      deleteKb: (id) =>
        updateNode({
          knowledgeBases: kbs.filter((k) => k.id !== id),
          knowledgeBaseId: kbId === id ? null : kbId,
        }),

      /* ── Functions ── */
      selectFunctions: (ids) => updateNode({ functionIds: ids }),
      createFunction: () => {
        const id = `fn_${Date.now()}`;
        updateNode({
          availableFunctions: [...fns, { id, name: "Untitled", code: "" }],
        });
        return id;
      },
      saveFunction: (updated) =>
        updateNode({ availableFunctions: fns.map((f) => f.id === updated.id ? updated : f) }),
      deleteFunction: (id) =>
        updateNode({
          availableFunctions: fns.filter((f) => f.id !== id),
          functionIds: fnIds.filter((fid) => fid !== id),
        }),
    },
  };
}