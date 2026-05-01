import React, { useState, useEffect } from "react";
import "./DurationSelector.css";
import PropTypes from "prop-types";
import { NodeToolbar, Position } from "@xyflow/react";

const durations = [1, 2, 5, 10];

export default function DurationSelector({ selectedNode, updateNode }) {
    const [selected, setSelected] = useState(selectedNode?.data?.delayDuration);

    // keep state in sync if node changes
    useEffect(() => {
        setSelected(selectedNode?.data?.delayDuration);
    }, [selectedNode]);

    const handleSelect = (value) => {
        setSelected(value);
        updateNode({
            delayDuration: value,
        });
    };

    return (
        <NodeToolbar
            nodeId={selectedNode.id}
            isVisible={true}
            position={Position.Right} // 👈 attaches to right side
            offset={10} // 👈 spacing from node
        >
            <div className="duration-tooltip">
                <p className="title">Select duration</p>

                <div className="button-group">
                    {durations.map((item) => (
                        <button
                            key={item}
                            className={`duration-btn ${selected === item ? "active" : ""}`}
                            onClick={() => handleSelect(item)}
                        >
                            {item + "s"}
                        </button>
                    ))}
                </div>
            </div>
        </NodeToolbar>
    );
}

DurationSelector.propTypes = {
    selectedNode: PropTypes.object.isRequired,
    updateNode: PropTypes.func.isRequired,
};
