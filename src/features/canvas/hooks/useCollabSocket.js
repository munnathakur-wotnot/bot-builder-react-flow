import { useCallback, useEffect, useRef, useState } from "react";
import socket from "../../socket/useSocket.js";

/**
 * Encapsulates every socket event related to collaborative editing:
 *   - node-selected / node-unselected
 *   - node-drag-start / node-drag-end  (with drag-lock enforcement)
 *   - node-menu-open / node-menu-close
 *   - node-changed
 *   - active-drag-locks / active-menu-locks  (catch-up on join)
 *
 * @param {{ selectedNodeId: string|null, menuState: object|null, updateSingleNode: Function, setNodes: Function }} param0
 */
export function useCollabSocket({
  selectedNodeId,
  menuState,
  updateSingleNode,
  setNodes,
}) {
  const [remoteDragMap, setRemoteDragMap] = useState({});
  const [remoteTypingMap, setRemoteTypingMap] = useState({});

  // eslint-disable-next-line no-unused-vars
  const [remoteMenuMap, setRemoteMenuMap] = useState({});

  // Stable ref so drag-start handler can read latest map without closure issues
  const remoteDragMapRef = useRef({});
  remoteDragMapRef.current = remoteDragMap;

  // userId -> { nodeId, name, color } — tracks every remote user's selected node
  const remoteSelectionMapRef = useRef({});

  // ── Emit: node selected / unselected ─────────────────────────
  useEffect(() => {
    if (selectedNodeId) {
      socket.emit("node-selected", { nodeId: selectedNodeId });
    } else {
      socket.emit("node-unselected");
    }
  }, [selectedNodeId]);

  // ── Emit: menu open / close ───────────────────────────────────
  const prevMenuNodeIdRef = useRef(null);
  useEffect(() => {
    const prev = prevMenuNodeIdRef.current;
    const curr = menuState?.nodeId ?? null;

    if (curr && curr !== prev) {
      socket.emit("node-menu-open", { nodeId: curr });
    }
    if (prev && prev !== curr) {
      socket.emit("node-menu-close", { nodeId: prev });
    }

    prevMenuNodeIdRef.current = curr;
  }, [menuState]);

  // ── Socket listeners ──────────────────────────────────────────
  useEffect(() => {
    const handleNodeSelected = ({ userId, name, color, nodeId }) => {
      // Clear the previous node this user had selected (if different)
      const prev = remoteSelectionMapRef.current[userId];
      if (prev?.nodeId && prev.nodeId !== nodeId) {
        updateSingleNode(prev.nodeId, (n) => ({
          ...n,
          data: { ...n.data, isSearchHighlight: false, selectedBy: null, selectedByColor: null },
        }));
      }
      remoteSelectionMapRef.current[userId] = { nodeId, name, color };
      updateSingleNode(nodeId, (n) => ({
        ...n,
        data: { ...n.data, isSearchHighlight: true, selectedBy: name, selectedByColor: color },
      }));
    };

    const handleNodeUnselected = ({ userId }) => {
      const prev = remoteSelectionMapRef.current[userId];
      if (prev?.nodeId) {
        updateSingleNode(prev.nodeId, (n) => ({
          ...n,
          data: { ...n.data, isSearchHighlight: false, selectedBy: null, selectedByColor: null },
        }));
      }
      delete remoteSelectionMapRef.current[userId];
    };

    const handleNodeDragStart = ({ nodeId, name, color }) => {
      setRemoteDragMap((prev) => ({ ...prev, [nodeId]: { name, color } }));
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                draggable: false,
                data: { ...n.data, isDraggedBy: name, isDraggedByColor: color },
              }
            : n,
        ),
      );
    };

    const handleNodeDragEnd = ({ nodeId }) => {
      setRemoteDragMap((prev) => {
        const copy = { ...prev };
        delete copy[nodeId];
        return copy;
      });
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                draggable: true,
                data: { ...n.data, isDraggedBy: null, isDraggedByColor: null },
              }
            : n,
        ),
      );
    };

    const handleNodeMenuOpen = ({ nodeId, name, color }) => {
      setRemoteMenuMap((prev) => ({ ...prev, [nodeId]: { name, color } }));
      updateSingleNode(nodeId, (n) => ({
        ...n,
        data: { ...n.data, isMenuOpenBy: name, isMenuOpenByColor: color },
      }));
    };

    const handleNodeMenuClose = ({ nodeId }) => {
      setRemoteMenuMap((prev) => {
        const copy = { ...prev };
        delete copy[nodeId];
        return copy;
      });
      updateSingleNode(nodeId, (n) => ({
        ...n,
        data: { ...n.data, isMenuOpenBy: null, isMenuOpenByColor: null },
      }));
    };

    const handleNodeChanged = ({ nodeId, data }) => {
      updateSingleNode(nodeId, (n) => ({ ...n, data: { ...n.data, ...data } }));
    };

    // Catch-up events sent by server when a user joins an active room
    const handleActiveDragLocks = (locks) => {
      locks.forEach(({ nodeId, name, color }) =>
        handleNodeDragStart({ nodeId, name, color }),
      );
    };

    const handleActiveMenuLocks = (locks) => {
      locks.forEach(({ nodeId, name, color }) =>
        handleNodeMenuOpen({ nodeId, name, color }),
      );
    };

    const handleTypingStart = ({ nodeId, field, name, color }) => {
      setRemoteTypingMap((prev) => ({
        ...prev,

        [nodeId]: {
          ...prev[nodeId],

          [field]: {
            name,
            color,
          },
        },
      }));
    };

    const handleTypingEnd = ({ nodeId, field }) => {
      setRemoteTypingMap((prev) => {
        const copy = { ...prev };

        if (!copy[nodeId]) return prev;

        delete copy[nodeId][field];

        if (Object.keys(copy[nodeId]).length === 0) {
          delete copy[nodeId];
        }

        return copy;
      });
    };
    const handleActiveTypingLocks = (locks) => {
      locks.forEach(({ nodeId, field, name, color }) => {
        handleTypingStart({
          nodeId,
          field,
          name,
          color,
        });
      });
    };

    const userLeftHandler = (user) => {
      // Clear the departing user's node selection highlight
      handleNodeUnselected({ userId: user.id });
      // drag/menu/typing locks are cleaned up via node-drag-end / node-menu-close / node-typing-end
      // which the server emits from releaseLocksForSocket before user-left fires
    };

    socket.on("user-left", userLeftHandler);

    socket.on("node-selected", handleNodeSelected);
    socket.on("node-unselected", handleNodeUnselected);
    socket.on("node-drag-start", handleNodeDragStart);
    socket.on("node-drag-end", handleNodeDragEnd);
    socket.on("node-menu-open", handleNodeMenuOpen);
    socket.on("node-menu-close", handleNodeMenuClose);
    socket.on("node-changed", handleNodeChanged);
    socket.on("active-drag-locks", handleActiveDragLocks);
    socket.on("active-menu-locks", handleActiveMenuLocks);
    socket.on("node-typing-start", handleTypingStart);
    socket.on("node-typing-end", handleTypingEnd);
    socket.on("active-typing-locks", handleActiveTypingLocks);

    return () => {
      socket.off("user-left", userLeftHandler);
      socket.off("node-selected", handleNodeSelected);
      socket.off("node-unselected", handleNodeUnselected);
      socket.off("node-drag-start", handleNodeDragStart);
      socket.off("node-drag-end", handleNodeDragEnd);
      socket.off("node-menu-open", handleNodeMenuOpen);
      socket.off("node-menu-close", handleNodeMenuClose);
      socket.off("node-changed", handleNodeChanged);
      socket.off("active-drag-locks", handleActiveDragLocks);
      socket.off("active-menu-locks", handleActiveMenuLocks);
      socket.off("node-typing-start", handleTypingStart);
      socket.off("node-typing-end", handleTypingEnd);
      socket.off("active-typing-locks", handleActiveTypingLocks);
    };
  }, [updateSingleNode, setNodes]);

  // ── Emit helpers exposed to Canvas ────────────────────────────
  const emitDragStart = useCallback((nodeId) => {
    socket.emit("node-drag-start", { nodeId });
  }, []);

  const emitDragEnd = useCallback((nodeId) => {
    socket.emit("node-drag-end", { nodeId });
  }, []);

  const emitNodeChanged = useCallback((nodeId, data) => {
    socket.emit("node-changed", { nodeId, data });
  }, []);

  const emitTypingStart = useCallback((nodeId, field) => {
    socket.emit("node-typing-start", {
      nodeId,
      field,
    });
  }, []);

  const emitTypingEnd = useCallback((nodeId, field) => {
    socket.emit("node-typing-end", {
      nodeId,
      field,
    });
  }, []);

  return {
    /** Remote drag-lock map ref — read synchronously inside callbacks */
    remoteDragMapRef,
    /** Emit that this client started dragging a node */
    emitDragStart,
    /** Emit that this client stopped dragging a node */
    emitDragEnd,
    /** Emit that a node's data changed (for sidebar updates) */
    emitNodeChanged,
    remoteTypingMap,
    emitTypingStart,
    emitTypingEnd,
  };
}
