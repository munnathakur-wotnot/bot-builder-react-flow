import { useCallback, useRef } from "react";

/**
 * Handles group-drag behaviour for carousel nodes.
 * Dragging the carousel root (or any card belonging to it) moves the
 * entire group together.
 */
export function useGroupDrag(nodesRef, setNodes) {
  const dragStartRef = useRef({});

  const getGroupId = useCallback(
    (node) =>
      node.data?.type === "carousel" || node.data?.type === "conditionRoot"
        ? node.id
        : null,
    [],
  );

  const onGroupNodeDragStart = useCallback(
    (_, node) => {
      const groupId = getGroupId(node);
      if (!groupId) return;
      const snapshot = {};
      nodesRef.current.forEach((n) => {
        if (n.id === groupId || n.data?.groupId === groupId) {
          snapshot[n.id] = { x: n.position.x, y: n.position.y };
        }
      });
      dragStartRef.current = snapshot;
    },
    [getGroupId, nodesRef],
  );

  const onGroupNodeDrag = useCallback(
    (_, node) => {
      const groupId = getGroupId(node);
      if (!groupId) return;
      const startPos = dragStartRef.current[node.id];
      if (!startPos) return;
      const dx = node.position.x - startPos.x;
      const dy = node.position.y - startPos.y;
      if (dx === 0 && dy === 0) return;
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) return n;
          if (n.id !== groupId && n.data?.groupId !== groupId) return n;
          const nStart = dragStartRef.current[n.id];
          if (!nStart) return n;
          return {
            ...n,
            position: { x: nStart.x + dx, y: nStart.y + dy },
          };
        }),
      );
    },
    [getGroupId, setNodes],
  );

  return { onGroupNodeDragStart, onGroupNodeDrag };
}
