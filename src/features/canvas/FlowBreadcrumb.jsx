import React from "react";
import PropTypes from "prop-types";
import { Panel } from "@xyflow/react";

/**
 * Breadcrumb + flow-scope selector rendered inside ReactFlow as a Panel.
 * Shows:  ⌂  /  Flow Name  ▼
 * Plus a "Blocks: N" counter below.
 */
export default function FlowBreadcrumb({
  activeFlowId,
  activeFlowLabel,
  flowOptions,
  visibleNodes,
  onGoHome,
  onSelectFlow,
}) {
  return (
    <Panel position="top-left" className="flow-scope-panel">
      <div className="flow-scope-panel__breadcrumb">
        {/* Home icon */}
        <button
          className={`flow-scope-panel__home${activeFlowId === null ? " flow-scope-panel__home--active" : ""}`}
          onClick={onGoHome}
          title="Main Flow"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        </button>

        {/* Slash + active flow name */}
        {activeFlowId !== null && (
          <>
            <span className="flow-scope-panel__sep">/</span>
            <span className="flow-scope-panel__current">{activeFlowLabel}</span>
          </>
        )}

        {/* Chevron dropdown — only shown when flows exist */}
        {flowOptions.length > 0 && (
          <div className="flow-scope-panel__dropdown-wrap">
            <button
              className="flow-scope-panel__chevron"
              aria-label="Select flow"
            >
              <svg width="10" height="10" viewBox="0 0 10 6" fill="none">
                <path
                  d="M1 1l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <select
              className="flow-scope-panel__hidden-select"
              value={activeFlowId ?? ""}
              onChange={(e) => onSelectFlow(e.target.value)}
            >
              <option value="">Main Flow</option>
              {flowOptions.map((flow) => (
                <option key={flow.id} value={flow.id}>
                  {flow.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Blocks counter */}
      <div className="flow-scope-panel__blocks">
        Blocks: {visibleNodes.filter((n) => !n.data.isSubNode).length}
      </div>
    </Panel>
  );
}

FlowBreadcrumb.propTypes = {
  activeFlowId: PropTypes.string,
  activeFlowLabel: PropTypes.string,
  flowOptions: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, label: PropTypes.string }),
  ).isRequired,
  visibleNodes: PropTypes.array.isRequired,
  onGoHome: PropTypes.func.isRequired,
  onSelectFlow: PropTypes.func.isRequired,
};

FlowBreadcrumb.defaultProps = {
  activeFlowId: null,
  activeFlowLabel: null,
};
