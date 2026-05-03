import { useCallback } from "react";
import { removeNodeConnectionsForEdges } from "../utils";

/**
 * Encapsulates delete / copy / clone logic for canvas nodes.
 * Carousel-aware: delete removes the full group; clone deep-copies it.
 */
export function useNodeActions({
  nodesRef,
  edges,
  setNodes,
  setEdges,
  setSelectedNodeId,
  getNextNodeId,
}) {
  // ── Delete ────────────────────────────────────────────────────
  const deleteNode = useCallback(
    (nodeId) => {
      const allNodes = nodesRef.current;
      const target = allNodes.find((n) => n.id === nodeId);
      const isCarousel = target?.data?.type === "carousel";

      const idsToRemove = new Set([nodeId]);
      if (isCarousel) {
        allNodes.forEach((n) => {
          if (n.data?.groupId === nodeId) idsToRemove.add(n.id);
        });
      }

      setEdges((eds) => {
        const connectedEdges = eds.filter(
          (e) => idsToRemove.has(e.source) || idsToRemove.has(e.target),
        );
        const remainingEdges = eds.filter(
          (e) => !idsToRemove.has(e.source) && !idsToRemove.has(e.target),
        );
        setNodes((nds) =>
          removeNodeConnectionsForEdges(
            nds.filter((n) => !idsToRemove.has(n.id)),
            connectedEdges,
          ),
        );
        return remainingEdges;
      });

      setSelectedNodeId((prev) => (idsToRemove.has(prev) ? null : prev));
    },
    [nodesRef, setEdges, setNodes, setSelectedNodeId],
  );

  // ── Copy (to clipboard) ───────────────────────────────────────
  const copyNode = useCallback(
    (nodeId) => {
      const node = nodesRef.current.find((n) => n.id === nodeId);
      if (!node) return;
      const text = JSON.stringify({ type: node.data.type, data: node.data }, null, 2);
      navigator.clipboard?.writeText(text).catch(() => {});
    },
    [nodesRef],
  );

  // ── Clone ─────────────────────────────────────────────────────
  const cloneNode = useCallback(
    (nodeId) => {
      const allNodes = nodesRef.current;
      const node = allNodes.find((n) => n.id === nodeId);
      if (!node) return;

      const OFFSET_X = 300;
      const OFFSET_Y = 20;

      if (node.data?.type !== "carousel") {
        const newId = getNextNodeId();
        setNodes((nds) => [
          ...nds,
          {
            id: newId,
            type: node.type,
            position: { x: node.position.x + OFFSET_X, y: node.position.y + OFFSET_Y },
            selected: false,
            dragging: false,
            data: {
              ...node.data,
              id: newId,
              inPorts: [],
              outPorts: [],
              successOutport: [],
              failureOutport: [],
              connected: false,
              groupId: undefined,
            },
          },
        ]);
        setSelectedNodeId(newId);
        return;
      }

      // Carousel group clone — remap every ID
      const groupMembers = allNodes.filter((n) => n.data?.groupId === nodeId);
      const idMap = new Map();
      idMap.set(nodeId, getNextNodeId());
      groupMembers.forEach((n) => idMap.set(n.id, getNextNodeId()));

      const newCarouselId = idMap.get(nodeId);

      const clonedRoot = {
        id: newCarouselId,
        type: node.type,
        position: { x: node.position.x + OFFSET_X, y: node.position.y + OFFSET_Y },
        selected: false,
        dragging: false,
        data: {
          ...node.data,
          id: newCarouselId,
          inPorts: [],
          outPorts: (node.data.outPorts ?? []).map((id) => idMap.get(id) ?? id),
          successOutport: [],
          failureOutport: [],
          connected: node.data.connected ?? false,
          groupId: undefined,
          cards: (node.data.cards ?? []).map((c) => ({
            ...c,
            id: idMap.get(c.id) ?? c.id,
            buttons: (c.buttons ?? []).map((b) => ({ ...b, id: idMap.get(b.id) ?? b.id })),
          })),
        },
      };

      const clonedMembers = groupMembers.map((m) => ({
        id: idMap.get(m.id),
        type: m.type,
        position: { x: m.position.x + OFFSET_X, y: m.position.y + OFFSET_Y },
        selected: false,
        dragging: false,
        data: {
          ...m.data,
          id: idMap.get(m.id),
          groupId: newCarouselId,
          inPorts: (m.data.inPorts ?? []).map((id) => idMap.get(id) ?? id),
          outPorts: (m.data.outPorts ?? []).map((id) => idMap.get(id) ?? id),
          connected: m.data.connected ?? false,
          ...(m.data.buttons
            ? { buttons: m.data.buttons.map((b) => ({ ...b, id: idMap.get(b.id) ?? b.id })) }
            : {}),
        },
      }));

      const groupIds = new Set(idMap.keys());
      const clonedEdges = edges
        .filter((e) => groupIds.has(e.source) && groupIds.has(e.target))
        .map((e) => ({
          ...e,
          id: `${e.id}_clone_${newCarouselId}`,
          source: idMap.get(e.source),
          target: idMap.get(e.target),
        }));

      setNodes((nds) => [...nds, clonedRoot, ...clonedMembers]);
      setEdges((eds) => [...eds, ...clonedEdges]);
      setSelectedNodeId(newCarouselId);
    },
    [nodesRef, edges, getNextNodeId, setNodes, setEdges, setSelectedNodeId],
  );

  // ── Multi-select: delete all selected root nodes (+ their groups) ──
  const deleteNodes = useCallback(
    (nodeIds) => { nodeIds.forEach((id) => deleteNode(id)); },
    [deleteNode],
  );

  // ── Multi-select: copy all selected nodes to clipboard ────────
  const copyNodes = useCallback(
    (nodeIds) => {
      const allNodes = nodesRef.current;
      const items = nodeIds
        .map((id) => allNodes.find((n) => n.id === id))
        .filter(Boolean)
        .map((n) => ({ type: n.data.type, data: n.data }));
      navigator.clipboard?.writeText(JSON.stringify(items, null, 2)).catch(() => {});
    },
    [nodesRef],
  );

  // ── Multi-select: clone all selected nodes preserving inter-node edges ─
  const cloneNodes = useCallback(
    (nodeIds) => {
      const allNodes = nodesRef.current;
      const OFFSET_X = 300;
      const OFFSET_Y = 20;

      // Expand selection: add carousel group members for any carousel root in nodeIds
      const expandedIds = new Set(nodeIds);
      nodeIds.forEach((id) => {
        const node = allNodes.find((n) => n.id === id);
        if (node?.data?.type === "carousel") {
          allNodes.forEach((n) => {
            if (n.data?.groupId === id) expandedIds.add(n.id);
          });
        }
      });

      // Build one shared old→new ID map for every node being cloned
      const idMap = new Map();
      expandedIds.forEach((id) => idMap.set(id, getNextNodeId()));

      // Clone each node
      const clonedNodes = [];
      expandedIds.forEach((id) => {
        const node = allNodes.find((n) => n.id === id);
        if (!node) return;
        const newId = idMap.get(id);
        const isCarouselRoot = node.data?.type === "carousel";

        // For group members, the new groupId is the remapped carousel root id
        const originalGroupId = node.data?.groupId;
        const newGroupId = originalGroupId ? idMap.get(originalGroupId) : undefined;

        clonedNodes.push({
          id: newId,
          type: node.type,
          position: { x: node.position.x + OFFSET_X, y: node.position.y + OFFSET_Y },
          selected: false,
          dragging: false,
          data: {
            ...node.data,
            id: newId,
            groupId: newGroupId,
            // Remap ports that point to other selected nodes; drop external connections
            inPorts: (node.data.inPorts ?? [])
              .filter((pid) => idMap.has(pid))
              .map((pid) => idMap.get(pid)),
            outPorts: (node.data.outPorts ?? [])
              .filter((pid) => idMap.has(pid))
              .map((pid) => idMap.get(pid)),
            successOutport: (node.data.successOutport ?? [])
              .filter((pid) => idMap.has(pid))
              .map((pid) => idMap.get(pid)),
            failureOutport: (node.data.failureOutport ?? [])
              .filter((pid) => idMap.has(pid))
              .map((pid) => idMap.get(pid)),
            connected:
              (node.data.inPorts ?? []).some((pid) => idMap.has(pid)) ||
              (node.data.outPorts ?? []).some((pid) => idMap.has(pid)) ||
              (node.data.successOutport ?? []).some((pid) => idMap.has(pid)) ||
              (node.data.failureOutport ?? []).some((pid) => idMap.has(pid)),
            // Remap carousel card/button IDs
            ...(isCarouselRoot && node.data.cards
              ? {
                  cards: node.data.cards.map((c) => ({
                    ...c,
                    id: idMap.get(c.id) ?? c.id,
                    buttons: (c.buttons ?? []).map((b) => ({
                      ...b,
                      id: idMap.get(b.id) ?? b.id,
                    })),
                  })),
                }
              : {}),
            // Remap button IDs for card nodes
            ...(node.data.buttons
              ? {
                  buttons: node.data.buttons.map((b) => ({
                    ...b,
                    id: idMap.get(b.id) ?? b.id,
                  })),
                }
              : {}),
          },
        });
      });

      // Clone all edges whose both ends are inside the expanded selection
      const clonedEdges = edges
        .filter((e) => expandedIds.has(e.source) && expandedIds.has(e.target))
        .map((e) => ({
          ...e,
          id: `${e.id}_ms_${idMap.get(e.source)}`,
          source: idMap.get(e.source),
          target: idMap.get(e.target),
        }));

      setNodes((nds) => [...nds, ...clonedNodes]);
      setEdges((eds) => [...eds, ...clonedEdges]);
    },
    [nodesRef, edges, getNextNodeId, setNodes, setEdges],
  );

  return { deleteNode, copyNode, cloneNode, deleteNodes, copyNodes, cloneNodes };
}
