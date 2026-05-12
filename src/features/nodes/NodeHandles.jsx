import React from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "@xyflow/react";
import "./CustomNode.css";

function Target() {
    return (
        <Handle
            type="target"
            position={Position.Top}
            className="custom-node__handle custom-node__handle--target"
        />
    );
}

function Source({
    isDoubleOutport,
    hasOutgoing,
    hasSuccessOutport,
    hasFailureOutport,
    isSelfLoop,
    onMouseDown,
    hidden,
}) {
    const hiddenStyle = hidden ? { visibility: "hidden" } : {};

    if (isDoubleOutport) {
        return (
            <>
                <Handle
                    type="source"
                    id="success"
                    position={Position.Bottom}
                    style={{ left: "30%", ...hiddenStyle }}
                    className={`custom-node__handle custom-node__handle--source
            ${isSelfLoop
                            ? "custom-node__handle--self-loop"
                            : hasSuccessOutport
                                ? "custom-node__handle--source-connected"
                                : "custom-node__handle--source-add"
                        }`}
                    isConnectable={!hasSuccessOutport || isSelfLoop}
                    onMouseDown={(e) => onMouseDown(e, "success")}
                />

                <Handle
                    type="source"
                    id="failure"
                    position={Position.Bottom}
                    style={{ left: "70%", ...hiddenStyle }}
                    className={`custom-node__handle custom-node__handle--source
            ${hasFailureOutport
                            ? "custom-node__handle--source-connected"
                            : "custom-node__handle--source-add"
                        }`}
                    isConnectable={!hasFailureOutport}
                    onMouseDown={(e) => onMouseDown(e, "failure")}
                />
            </>
        );
    }

    return (
        <Handle
            type="source"
            id="default"
            position={Position.Bottom}
            style={hiddenStyle}
            className={`custom-node__handle custom-node__handle--source
        ${hasOutgoing
                    ? "custom-node__handle--source-connected"
                    : "custom-node__handle--source-add"
                }`}
            isConnectable
            onMouseDown={onMouseDown}
        />
    );
}

Source.propTypes = {
    isDoubleOutport: PropTypes.bool,
    hasOutgoing: PropTypes.bool,
    hasSuccessOutport: PropTypes.bool,
    hasFailureOutport: PropTypes.bool,
    isSelfLoop: PropTypes.bool,
    onMouseDown: PropTypes.func,
    hidden: PropTypes.bool,
};

export default {
    Target,
    Source,
};
