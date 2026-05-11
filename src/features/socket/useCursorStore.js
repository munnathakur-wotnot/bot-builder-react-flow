// cursorStore.js

import { useSyncExternalStore } from "react";
import socket from "./useSocket";

let state = {
  me: null,
  cursors: {},
};

const listeners = new Set();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const setState = (updater) => {
  state =
    typeof updater === "function" ? updater(state) : { ...state, ...updater };

  emitChange();
};

export const cursorStore = {
  subscribe(listener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot() {
    return state;
  },

  init() {
    // avoid multiple bindings
    if (this.initialized) return;

    this.initialized = true;

    // me
    socket.on("me", (user) => {
      setState((prev) => ({
        ...prev,
        me: user,
        cursors: {
          ...prev.cursors,
          [user.id]: user,
        },
      }));
    });

    // existing users
    socket.on("existing-users", (users) => {
      const map = {};

      users.forEach((user) => {
        map[user.id] = user;
      });

      setState((prev) => ({
        ...prev,
        cursors: {
          ...prev.cursors,
          ...map,
        },
      }));
    });

    // new user
    socket.on("user-joined", (user) => {
      setState((prev) => ({
        ...prev,
        cursors: {
          ...prev.cursors,
          [user.id]: user,
        },
      }));
    });

    // move
    socket.on("cursor-move", (user) => {
      setState((prev) => ({
        ...prev,
        cursors: {
          ...prev.cursors,
          [user.id]: {
            ...prev.cursors[user.id],
            ...user,
          },
        },
      }));
    });

    // remove
    socket.on("user-left", (user) => {
      console.log("User left:", user);
      setState((prev) => {
        const copy = { ...prev.cursors };

        delete copy[user.id];

        return {
          ...prev,
          cursors: copy,
        };
      });

      console.log("User left:", user);
    });
  },
};

export function useCursorStore() {
  return useSyncExternalStore(cursorStore.subscribe, cursorStore.getSnapshot);
}
