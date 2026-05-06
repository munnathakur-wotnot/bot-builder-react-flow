import { useSyncExternalStore } from "react";

/**
 * Returns "active" | "executed" | "none" for the given id,
 * subscribing to simulationStore so only the affected node/edge re-renders.
 */
export function useSimulationStatus(simulationStore, id) {
  return useSyncExternalStore(
    simulationStore.subscribe,
    () => {
      const { executedIdsSet, activeId } = simulationStore.getState();
      if (activeId === id) return "active";
      if (executedIdsSet.has(id)) return "executed";
      return "none";
    },
  );
}
