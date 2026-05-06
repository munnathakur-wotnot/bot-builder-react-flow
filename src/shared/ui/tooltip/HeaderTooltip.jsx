import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { layoutNodesDagre } from "../../../features/canvas/layout";
import { useReactFlow } from "@xyflow/react";
import PropTypes from "prop-types";
import AppInput from "../atoms/AppInput";

//  import icons
import {
    SearchIcon,
    BrandIcon,
    AutoLayoutIcon,
    ChevronDownIcon,
    ArrowRightIcon,
    PlayIcon,
    StopIcon,
    ImportIcon,
    ExportIcon,
} from "./headerTooltipIcon";

function HeaderTooltip(props) {
    const {
        edges,
        setNodes,
        nuberOfNodes,
        setNumberOfNodes,
        totalNodes,
        onOpenSearch,
        validationErrors,
        nodes,
        onSelectErrorNode,
        isSimulating,
        onTest,
        onStopTest,
        onImport,
        onExport,
    } = props;

    const { fitView } = useReactFlow();
    const [errDropdownOpen, setErrDropdownOpen] = useState(false);
    const errDropdownRef = useRef(null);

    const errorNodeIds = Object.keys(validationErrors ?? {});
    const errorCount = errorNodeIds.length;

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
        requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }));
    }, [edges, fitView, setNodes]);

    return (
        <div className="layout-toolbar">
            {/* Brand */}
            <div className="layout-toolbar__brand">
                <div className="layout-toolbar__brand-icon">
                    <BrandIcon />
                </div>
                <span className="layout-toolbar__brand-name">Bot Builder</span>
            </div>

            {/* Left */}
            <div className="layout-toolbar__left">
                <button className="layout-toolbar__btn" onClick={onAutoLayout}>
                    <AutoLayoutIcon />
                    Auto Layout
                </button>

                <div className="layout-toolbar__divider" />

                <div className="layout-toolbar__add-group">
                    <label>Bulk add</label>
                    <AppInput
                        type="number"
                        min="1"
                        onChange={(e) => setNumberOfNodes(Number(e.target.value))}
                        value={nuberOfNodes}
                    />
                </div>
            </div>

            {/* Right */}
            <div className="layout-toolbar__right">
                <span className="layout-toolbar__count">
                    <span className="layout-toolbar__count-dot" />
                    {totalNodes} nodes
                </span>

                {/* Errors */}
                {errorCount > 0 && (
                    <div className="layout-toolbar__error-wrap" ref={errDropdownRef}>
                        <button
                            className="layout-toolbar__error-btn"
                            onClick={() => setErrDropdownOpen((o) => !o)}
                        >
                            {errorCount} error{errorCount > 1 ? "s" : ""} found!
                            <span
                                className={`layout-toolbar__error-chevron${errDropdownOpen ? " open" : ""}`}
                            >
                                <ChevronDownIcon />
                            </span>
                        </button>

                        {errDropdownOpen && (
                            <div className="layout-toolbar__error-dropdown">
                                {errorNodeIds.map((nodeId) => {
                                    const node = nodes?.find((n) => n.id === nodeId);
                                    if (!node) return null;

                                    return (
                                        <button
                                            key={nodeId}
                                            className="layout-toolbar__error-item"
                                            onClick={() => {
                                                setErrDropdownOpen(false);
                                                onSelectErrorNode?.(node);
                                            }}
                                        >
                                            <span>{node.data.title || "Untitled"}</span>
                                            <ArrowRightIcon />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <button className="layout-toolbar__btn" onClick={onOpenSearch}>
                    <SearchIcon />
                    Search nodes
                </button>

                <div className="layout-toolbar__divider" />

                <button className="layout-toolbar__btn" onClick={onImport}>
                    <ImportIcon />
                    Import
                </button>

                <button className="layout-toolbar__btn" onClick={onExport}>
                    <ExportIcon />
                    Export
                </button>

                {/* Test / Stop */}
                {errorCount === 0 &&
                    (isSimulating ? (
                        <button className="layout-toolbar__btn" onClick={onStopTest}>
                            <StopIcon />
                            Stop
                        </button>
                    ) : (
                        <button className="layout-toolbar__btn" onClick={onTest}>
                            <PlayIcon />
                            Test
                        </button>
                    ))}
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
    onImport: PropTypes.func,
    onExport: PropTypes.func,
};
export default HeaderTooltipMemo;
