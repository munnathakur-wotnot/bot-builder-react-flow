import React, { memo } from "react";
import PropTypes from "prop-types";
import { isEqual } from "lodash";
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

/**
 * Custom memo comparator — only the fields CustomSubNode actually renders.
 * Returning true = props are equal = skip re-render.
 */
function subNodeEqual(prev, next) {
    if (prev.id !== next.id) return false;
    const pd = prev.data;
    const nd = next.data;
    return (
        pd.type === nd.type &&
        pd.title === nd.title &&
        pd.icon === nd.icon &&
        pd.conditionType === nd.conditionType &&
        pd.isErrorShow === nd.isErrorShow &&
        pd.isSearchHighlight === nd.isSearchHighlight &&
        // Collab ephemeral
        pd.selectedBy === nd.selectedBy &&
        pd.selectedByColor === nd.selectedByColor &&
        pd.isDraggedBy === nd.isDraggedBy &&
        pd.isDraggedByColor === nd.isDraggedByColor &&
        pd.isMenuOpenBy === nd.isMenuOpenBy &&
        pd.isMenuOpenByColor === nd.isMenuOpenByColor &&
        // Handle connection state
        isEqual(pd.outPorts, nd.outPorts)
    );
}

export default memo(CustomSubNode, subNodeEqual);
