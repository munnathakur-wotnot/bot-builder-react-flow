import PropTypes from "prop-types";
import React, { createContext, useContext } from "react";

const FlowCallbacksContext = createContext(null);

export function FlowCallbacksProvider({ value, children }) {
  return (
    <FlowCallbacksContext.Provider value={value}>
      {children}
    </FlowCallbacksContext.Provider>
  );
}

FlowCallbacksProvider.propTypes = {
  value: PropTypes.shape({
    openMenu: PropTypes.func.isRequired,
    deleteEdge: PropTypes.func.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

export function useFlowCallbacks() {
  const ctx = useContext(FlowCallbacksContext);
  if (!ctx) {
    throw new Error(
      "useFlowCallbacks must be used within FlowCallbacksProvider",
    );
  }
  return ctx;
}
