import React, { useCallback } from "react";
import { layoutNodesDagre } from "../Canvas/layout";
import { useReactFlow } from "@xyflow/react";
import PropTypes from "prop-types";
export default function HeaderTooltip(props) {
    const { edges, setNodes } = props;

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
        </div>
    );
}

HeaderTooltip.propTypes = {
    edges: PropTypes.object,
    setNodes: PropTypes.func,
};
