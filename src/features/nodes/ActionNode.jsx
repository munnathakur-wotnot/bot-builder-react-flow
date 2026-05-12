import React, { memo } from "react";
import PropTypes from "prop-types";
import "./CustomNode.css";

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

        handleMouseDown,
        handleOpenMenu,
    } = useNodeInteractions({ id, data });

    console.log(data, "datais");

    const isStartNode = data.type === "start" || data.type === "flowStart";

    const isConnected = data?.connected;

    return (
        <div
            className={`${typeClassName} custom-node--action`}
            style={remoteUserStyle}
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

                    {data.title}

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

export default memo(ActionNode);
