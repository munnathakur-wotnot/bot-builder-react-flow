import React, { memo } from "react";
import PropTypes from "prop-types";
import "./CustomNode.css";

import NodeHandles from "./NodeHandles";
import NodeBadges from "./NodeBadges";
import NodeFooter from "./NodeFooter";

import { useNodeInteractions } from "./useNodeInteractions";
import NodeTooltips from "./NodeTooltips";

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

        handleMouseDown,
    } = useNodeInteractions({ id, data });

    return (
        <div className={typeClassName} style={remoteUserStyle}>
            <NodeBadges data={data} />

            {hasErrors && (
                <div className="custom-node__error-badge" title={nodeErrors.join("\n")}>
                    {nodeErrors.length}
                </div>
            )}

            <NodeHandles.Target />

            <div className="custom-node__header">
                <p className="custom-node__title">{data.title}</p>
            </div>

            <p className="custom-node__description">{data.description}</p>
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

export default memo(TextNode);
