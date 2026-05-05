import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { layoutNodesDagre } from "../../../features/canvas/layout";
import { useReactFlow } from "@xyflow/react";
import PropTypes from "prop-types";
import AppInput from "../atoms/AppInput";

const SearchIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

function HeaderTooltip(props) {
    const { edges, setNodes, nuberOfNodes, setNumberOfNodes, totalNodes, onOpenSearch, validationErrors, nodes, onSelectErrorNode, isSimulating, onTest, onStopTest } = props;

    const { fitView } = useReactFlow();
    const [errDropdownOpen, setErrDropdownOpen] = useState(false);
    const errDropdownRef = useRef(null);

    const errorNodeIds = Object.keys(validationErrors ?? {});
    const errorCount = errorNodeIds.length;

    // Close dropdown on outside click
    useEffect(() => {
        if (!errDropdownOpen) return;
        const handler = (e) => {
            if (!errDropdownRef.current?.contains(e.target)) {
                setErrDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [errDropdownOpen]);
    const onAutoLayout = useCallback(() => {
        setNodes((currNodes) => layoutNodesDagre(currNodes, edges));
        // Let React apply positions first, then fit.
        requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }));
    }, [edges, fitView, setNodes]);

    return (
        <div className="layout-toolbar">
            {/* Brand */}
            <div className="layout-toolbar__brand">
                <div className="layout-toolbar__brand-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </div>
                <span className="layout-toolbar__brand-name">Bot Builder</span>
            </div>

            {/* Left actions */}
            <div className="layout-toolbar__left">
                <button
                    type="button"
                    className="layout-toolbar__btn"
                    onClick={onAutoLayout}
                    title="Auto-arrange all nodes"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    Auto Layout
                </button>

                <div className="layout-toolbar__divider" />

                {/* Nodes to add */}
                <div className="layout-toolbar__add-group">
                    <label className="layout-toolbar__label" htmlFor="node-count-input">
                        Bulk add
                    </label>
                    <AppInput
                        id="node-count-input"
                        className="layout-toolbar__number-input"
                        type="number"
                        min="1"
                        onChange={(e) => setNumberOfNodes(Number(e.target.value))}
                        value={nuberOfNodes}
                    />
                </div>
            </div>

            {/* Right actions */}
            <div className="layout-toolbar__right">
                <span className="layout-toolbar__count">
                    <span className="layout-toolbar__count-dot" />
                    {totalNodes} nodes
                </span>

                {/* Error indicator */}
                {errorCount > 0 && (
                    <div className="layout-toolbar__error-wrap" ref={errDropdownRef}>
                        <button
                            type="button"
                            className="layout-toolbar__error-btn"
                            onClick={() => setErrDropdownOpen((o) => !o)}
                        >
                            {errorCount} error{errorCount > 1 ? "s" : ""} found!
                            <span className={`layout-toolbar__error-chevron${errDropdownOpen ? " layout-toolbar__error-chevron--open" : ""}`}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </span>
                        </button>

                        {errDropdownOpen && (
                            <div className="layout-toolbar__error-dropdown">
                                {errorNodeIds.map((nodeId) => {
                                    const node = nodes?.find((n) => n.id === nodeId);
                                    if (!node) return null;
                                    const errs = validationErrors[nodeId];
                                    return (
                                        <button
                                            key={nodeId}
                                            type="button"
                                            className="layout-toolbar__error-item"
                                            onClick={() => {
                                                setErrDropdownOpen(false);
                                                onSelectErrorNode?.(node);
                                            }}
                                        >
                                            <span className="layout-toolbar__error-item-body">
                                                <span className="layout-toolbar__error-item-title">
                                                    {node.data.title || "Untitled"}
                                                </span>
                                                <span className="layout-toolbar__error-item-msgs">
                                                    {errs.join(" · ")}
                                                </span>
                                            </span>
                                            <svg className="layout-toolbar__error-item-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    className="layout-toolbar__btn layout-toolbar__search-btn"
                    onClick={onOpenSearch}
                    title="Search nodes (Ctrl+K)"
                >
                    <SearchIcon />
                    Search nodes
                </button>

                {/* Test / Stop button — only when no errors */}
                {errorCount === 0 && (
                    isSimulating ? (
                        <button
                            type="button"
                            className="layout-toolbar__btn layout-toolbar__stop-btn"
                            onClick={onStopTest}
                        >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <rect x="4" y="4" width="16" height="16" rx="2" />
                            </svg>
                            Stop
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="layout-toolbar__btn layout-toolbar__test-btn"
                            onClick={onTest}
                        >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M5 3l14 9-14 9V3z" />
                            </svg>
                            Test
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
const HeaderTooltipMemo = memo(HeaderTooltip, (prev, next) => {
    return (
        prev.nuberOfNodes === next.nuberOfNodes &&
        prev.totalNodes === next.totalNodes &&
        prev.validationErrors === next.validationErrors &&
        prev.isSimulating === next.isSimulating
    );
});
export default HeaderTooltipMemo;
HeaderTooltip.propTypes = {
    edges: PropTypes.object,
    setNodes: PropTypes.func,
    nuberOfNodes: PropTypes.number,
    setNumberOfNodes: PropTypes.func,
    isProcessing: PropTypes.bool,
    totalNodes: PropTypes.string,
    onOpenSearch: PropTypes.func,
    validationErrors: PropTypes.object,
    nodes: PropTypes.array,
    onSelectErrorNode: PropTypes.func,
    isSimulating: PropTypes.bool,
    onTest: PropTypes.func,
    onStopTest: PropTypes.func,
};
