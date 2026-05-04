import { NodeToolbar, Position } from "@xyflow/react";
import PropTypes from "prop-types";
import React from "react";

export default function SmallSidebar(props) {
    const { selectedNode, renderComponent } = props;
    const { RenderCompoent, renderProps } = renderComponent(props);

    return (
        <NodeToolbar
            nodeId={selectedNode.id}
            isVisible={true}
            position={Position.Right}
            offset={10}
        >
            <div
                className="duration-tooltip"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <RenderCompoent {...renderProps} />
            </div>
        </NodeToolbar>
    );
}

SmallSidebar.propTypes = {
    selectedNode: PropTypes.object.isRequired,
    updateNode: PropTypes.func.isRequired,
    renderComponent: PropTypes.func.isRequired,
};
