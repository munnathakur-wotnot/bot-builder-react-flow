import React, { useCallback } from "react";
import { layoutNodesDagre } from "../Canvas/layout";
import { useNodes, useReactFlow } from "@xyflow/react";
import PropTypes from "prop-types";
export default function HeaderTooltip(props) {
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
                Auto layout
            </button>
            <div className="layout-toolbar__btn">
                <label htmlFor="">Enter Number Of Nodes : </label>
                <input
                    className="layout-toolbar__btn"
                    type="number"
                    onChange={(e) => setNumberOfNodes(e.target.value)}
                    value={nuberOfNodes}
                />
            </div>
            <div className="layout-toolbar__btn">
                <label htmlFor="">Number Of Nodes : {totalNodes}</label>
            </div>
        </div>
    );
}

HeaderTooltip.propTypes = {
    edges: PropTypes.object,
    setNodes: PropTypes.func,
    nuberOfNodes: PropTypes.number,
    setNumberOfNodes: PropTypes.func,
    isProcessing: PropTypes.bool,
};
