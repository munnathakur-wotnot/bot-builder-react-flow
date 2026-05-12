import React, { memo } from "react";
import PropTypes from "prop-types";
import "./CustomNode.css";
import "./CustomSubNode.css";

import NodeHandles from "./NodeHandles";
import NodeBadges from "./NodeBadges";

import { useNodeInteractions } from "./useNodeInteractions";

function CustomSubNode({ id, data }) {
    const {
        typeClassName,
        remoteUserStyle,

        hasErrors,
        nodeErrors,

        isDoubleOutport,
        isSelfLoop,

        hasOutgoing,
        hasSuccessOutport,
        hasFailureOutport,

        isLockedByRemote,

        handleMouseDown,
    } = useNodeInteractions({ id, data });

    return (
        <div
            className={`${typeClassName} custom-node--subnode`}
            style={remoteUserStyle}
            data-locked={isLockedByRemote ? "true" : undefined}
        >
            <NodeBadges data={data} />

            {hasErrors && (
                <div className="custom-node__error-badge" title={nodeErrors.join("\n")}>
                    {nodeErrors.length}
                </div>
            )}

            {/* Target Handle */}
            <NodeHandles.Target />

            {/* Sub node header */}
            <div className="custom-node__subnode-header">
                <p className="custom-node__subnode-title">
                    <span>{data.icon}</span>
                    {data.title}
                </p>
            </div>

            {/* Source Handles */}
            <NodeHandles.Source
                isDoubleOutport={isDoubleOutport}
                hasOutgoing={hasOutgoing}
                hasSuccessOutport={hasSuccessOutport}
                hasFailureOutport={hasFailureOutport}
                isSelfLoop={isSelfLoop}
                onMouseDown={handleMouseDown}
            />
        </div>
    );
}

CustomSubNode.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
};

export default memo(CustomSubNode);
