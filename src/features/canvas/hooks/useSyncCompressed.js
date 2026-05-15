import { useSyncExternalStore } from "react";

let isCompressed = false;

const listeners = new Set();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => isCompressed;

export const setCompressed = (value) => {
  isCompressed = value;
  emitChange();
};

export const toggleCompressed = () => {
  isCompressed = !isCompressed;
  emitChange();
};

export const useSyncCompressed = () => {
  return useSyncExternalStore(subscribe, getSnapshot);
};
