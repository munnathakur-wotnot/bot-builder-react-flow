import React, { memo, useCallback } from "react";
import { layoutNodesDagre } from "../../../features/canvas/layout";
import { useNodes, useReactFlow } from "@xyflow/react";
import PropTypes from "prop-types";
import AppInput from "../atoms/AppInput";
function HeaderTooltip(props) {
    const { edges, setNodes, nuberOfNodes, setNumberOfNodes } = props;
    const nodes = useNodes();
    const totalNodes = nodes.length;

    const { fitView } = useReactFlow();
    const onAutoLayout = useCallback(() => {
        setNodes((currNodes) => layoutNodesDagre(currNodes, edges));
        // Let React apply positions first, then fit.
        requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }));
    }, [edges, fitView, setNodes]);

    return (
        <div className="layout-toolbar">
            <button
                type="button"
                className="layout-toolbar__btn"
                onClick={onAutoLayout}
            >
                ⚡ Auto layout
            </button>
            <div className="layout-toolbar__divider" />
            <label className="layout-toolbar__label" htmlFor="node-count-input">
                Nodes to add
            </label>
            <AppInput
                id="node-count-input"
                className="layout-toolbar__number-input"
                type="number"
                min="1"
                onChange={(e) => setNumberOfNodes(Number(e.target.value))}
                value={nuberOfNodes}
            />
            <div className="layout-toolbar__divider" />
            <span className="layout-toolbar__count">
                {totalNodes} on canvas
            </span>
        </div>
    );
}
const HeaderTooltipMemo = memo(HeaderTooltip);
export default HeaderTooltipMemo;
HeaderTooltip.propTypes = {
    edges: PropTypes.object,
    setNodes: PropTypes.func,
    nuberOfNodes: PropTypes.number,
    setNumberOfNodes: PropTypes.func,
    isProcessing: PropTypes.bool,
};
