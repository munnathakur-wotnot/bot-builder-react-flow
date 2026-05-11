import { useSyncExternalStore } from "react";

let viewport = {
  x: 0,
  y: 0,
  zoom: 1,
};

const listeners = new Set();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

export const viewportStore = {
  // subscribe
  subscribe(listener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },

  // snapshot
  getSnapshot() {
    return viewport;
  },

  // update viewport
  setViewport(nextViewport) {
    viewport = nextViewport;
    emitChange();
  },
};

export function useViewportStore() {
  return useSyncExternalStore(
    viewportStore.subscribe,
    viewportStore.getSnapshot,
  );
}
