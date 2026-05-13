import React, { memo } from "react";
import PropTypes from "prop-types";
import { isEqual } from "lodash";
import "./CustomNode.css";
import "./TextNode.css";

import NodeHandles from "./NodeHandles";
import NodeBadges from "./NodeBadges";
import NodeFooter from "./NodeFooter";

import { useNodeInteractions } from "./useNodeInteractions";
import NodeTooltips from "./NodeTooltips";
import { useSyncCompressed } from "../canvas/hooks/useSyncCompressed.js";

function TextNode({ id, data }) {
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

    const isCompressed = useSyncCompressed();

    return (
        <div
            className={typeClassName}
            style={remoteUserStyle}
            data-locked={isLockedByRemote ? "true" : undefined}
        >
            <NodeBadges data={data} />

            {hasErrors && (
                <div className="custom-node__error-badge" title={nodeErrors.join("\n")}>
                    {nodeErrors.length}
                </div>
            )}

            <NodeHandles.Target />

            <div className="custom-node__header">
                <p className="custom-node__title">
                    {" "}
                    {data?.extras?.config?.title || data.title}
                </p>
            </div>

            {!isCompressed && (
                <p className="custom-node__description">
                    {data?.extras?.config?.title}
                </p>
            )}
            <NodeTooltips id={id} />

            <NodeFooter data={data} />

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

TextNode.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
};

/**
 * Custom memo comparator — only the fields TextNode actually renders.
 * Returning true = props are equal = skip re-render.
 */
function textNodeEqual(prev, next) {
    if (prev.id !== next.id) return false;
    const pd = prev.data;
    const nd = next.data;
    return (
        pd.type === nd.type &&
        pd.title === nd.title &&
        pd.description === nd.description &&
        pd.connected === nd.connected &&
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
        // Activity footer
        pd.lastUpdatedBy?.at === nd.lastUpdatedBy?.at &&
        pd.createdBy?.id === nd.createdBy?.id &&
        // Handle connection state
        isEqual(pd.outPorts, nd.outPorts) &&
        isEqual(pd.successOutport, nd.successOutport) &&
        isEqual(pd.failureOutport, nd.failureOutport) &&
        // Content-heavy arrays — deep equal
        isEqual(pd.cards, nd.cards) &&
        isEqual(pd.fields, nd.fields) &&
        isEqual(pd.children, nd.children)
    );
}

export default memo(TextNode, textNodeEqual);
