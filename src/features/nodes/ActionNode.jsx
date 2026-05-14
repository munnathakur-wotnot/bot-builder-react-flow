import React, { memo } from "react";
import PropTypes from "prop-types";
import { isEqual } from "lodash";
import "./CustomNode.css";
import "./ActionNode.css";

import NodeHandles from "./NodeHandles";
import NodeBadges from "./NodeBadges";

import { useNodeInteractions } from "./useNodeInteractions";
import NodeTooltips from "./NodeTooltips";

function ActionNode({ id, data }) {
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
        handleOpenMenu,
    } = useNodeInteractions({ id, data });

    const isStartNode = data.type === "start" || data.type === "flowStart";

    const isConnected = data?.connected;

    return (
        <div
            className={`${typeClassName} custom-node--action`}
            style={remoteUserStyle}
            data-locked={isLockedByRemote ? "true" : undefined}
            onClick={
                isStartNode && !isConnected
                    ? (e) => handleOpenMenu({ event: e })
                    : undefined
            }
            role={isStartNode ? "button" : undefined}
            tabIndex={isStartNode ? 0 : undefined}
        >
            <NodeBadges data={data} />
            <NodeTooltips id={id} />

            {hasErrors && (
                <div className="custom-node__error-badge" title={nodeErrors.join("\n")}>
                    {nodeErrors.length}
                </div>
            )}

            {/* Target handle */}
            {!isStartNode && <NodeHandles.Target />}

            {/* Pill content */}
            <div className="custom-node__header-delay">
                <p className="small-node-title">
                    <span>{data.icon}</span>

                    {data?.extras?.config?.title || data?.title}

                    {data.delayDuration ? ` (${data.delayDuration}s)` : ""}
                </p>
            </div>

            {/* Source handles */}
            <NodeHandles.Source
                isDoubleOutport={isDoubleOutport}
                hasOutgoing={hasOutgoing}
                hasSuccessOutport={hasSuccessOutport}
                hasFailureOutport={hasFailureOutport}
                isSelfLoop={isSelfLoop}
                onMouseDown={handleMouseDown}
                hidden={isStartNode && isConnected}
            />
        </div>
    );
}

ActionNode.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
};

/**
 * Custom memo comparator — only the fields ActionNode actually renders.
 * Returning true = props are equal = skip re-render.
 */
function actionNodeEqual(prev, next) {
    if (prev.id !== next.id) return false;
    const pd = prev.data;
    const nd = next.data;
    return (
        pd.type === nd.type &&
        pd.extras?.config?.title === nd.extras?.config?.title &&
        pd.icon === nd.icon &&
        pd.connected === nd.connected &&
        pd.delayDuration === nd.delayDuration &&
        pd.doubleHandler === nd.doubleHandler &&
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
        isEqual(pd.outPorts, nd.outPorts) &&
        isEqual(pd.successOutport, nd.successOutport) &&
        isEqual(pd.failureOutport, nd.failureOutport)
    );
}

export default memo(ActionNode, actionNodeEqual);
