import { useCallback, useMemo } from "react";
import { useFlowCallbacks } from "../canvas/FlowCallbacksContext.jsx";
import { useSimulationStatus } from "../../shared/hooks/useSimulationStatus";

export function useNodeInteractions({ id, data }) {
  const { openMenu, validationErrors, simulationStore, isHandleClickRef } =
    useFlowCallbacks();

  const simulationStatus = useSimulationStatus(simulationStore, id);

  const isActive = simulationStatus === "active";
  const isExecuted = simulationStatus === "executed";

  const nodeErrors = validationErrors?.current?.[id] ?? [];

  const hasErrors = data.isErrorShow && nodeErrors.length > 0;

  const isDoubleOutport = data?.doubleHandler ?? false;

  const isSelfLoop = data?.successOutport?.[0] === id;

  const hasSuccessOutport = data?.successOutport?.length > 0;

  const hasFailureOutport = data?.failureOutport?.length > 0;

  const hasOutgoing = isDoubleOutport
    ? hasSuccessOutport && hasFailureOutport
    : data.outPorts?.length > 0;

  const handleOpenMenu = useCallback(
    ({ event, type, isMenuOpen }) => {
      event?.stopPropagation();

      const nodeEl = event?.target?.closest?.(".react-flow__node");

      const rect = nodeEl?.getBoundingClientRect();

      const centerX = rect ? rect.left + rect.width / 2 : event?.clientX;

      openMenu({
        nodeId: id,
        x: centerX,
        y: rect ? rect.bottom + 8 : (event?.clientY ?? 0) + 20,
        type,
        isSelfLoop,
        isMenuOpen,
      });
    },
    [id, openMenu, isSelfLoop],
  );

  const handleMouseDown = useCallback(
    (e, type) => {
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;

      const handleMouseUp = (upEvent) => {
        const dx = Math.abs(upEvent.clientX - startX);

        const dy = Math.abs(upEvent.clientY - startY);

        if (dx < 5 && dy < 5 && !hasOutgoing) {
          isHandleClickRef.current = true;

          handleOpenMenu({
            event: upEvent,
            type,
            isMenuOpen: true,
          });
        }

        requestAnimationFrame(() => {
          isHandleClickRef.current = false;
        });

        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleOpenMenu, hasOutgoing, isHandleClickRef],
  );

  const isLockedByRemote = Boolean(data?.isDraggedBy);

  const typeClassName = useMemo(() => {
    return [
      `custom-node custom-node--${data.type ?? "default"}`,
      data.isSearchHighlight ? "custom-node--search-highlight" : "",
      hasErrors ? "custom-node--has-errors" : "",
      isActive ? "custom-node--executing" : "",
      isExecuted ? "custom-node--executed" : "",
      data?.isDraggedBy ? "custom-node--drag-locked" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }, [data.type, data.isSearchHighlight, hasErrors, isActive, isExecuted, data?.isDraggedBy]);

  const borderColor =
    data?.isDraggedByColor || data?.isMenuOpenByColor || data?.selectedByColor;

  const remoteUserStyle = borderColor
    ? {
        border: `2px solid ${borderColor}`,
        boxShadow: `0 0 0 3px ${borderColor}33`,
      }
    : {};

  return {
    typeClassName,
    remoteUserStyle,

    nodeErrors,
    hasErrors,

    isDoubleOutport,
    isSelfLoop,

    hasOutgoing,
    hasSuccessOutport,
    hasFailureOutport,

    isActive,
    isExecuted,
    isLockedByRemote,

    handleMouseDown,
    handleOpenMenu,
  };
}
