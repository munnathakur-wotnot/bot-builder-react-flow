import React, { useMemo, useState } from "react";
import "./DurationSelector.css";
import PropTypes from "prop-types";
import { useReactFlow } from "@xyflow/react";

const durations = [1, 2, 5, 10];

export default function DurationSelector({
    selectedNode,
    updateNode,
    selectedNodeDetails,
}) {
    const [selected, setSelected] = useState(selectedNode?.data?.delayDuration);
    const { flowToScreenPosition } = useReactFlow(selectedNode);
    console.log(selectedNodeDetails, "InDelay");

    //  Convert flow position → screen position
    const position = useMemo(() => {
        if (!selectedNode || !flowToScreenPosition) return { x: 0, y: 0 };

        const { x, y } = flowToScreenPosition({
            x: selectedNode.position.x,
            y: selectedNode.position.y,
        });

        return {
            x: x + 180, //  right side offset (adjust)
            y: y - 20, //  top offset (adjust)
        };
    }, [selectedNode, flowToScreenPosition]);

    const handleSelect = (value) => {
        setSelected(value);
        updateNode({
            delayDuration: value,
        });
    };

    return (
        <div
            className="duration-tooltip"
            style={{
                position: "absolute",
                left: selectedNodeDetails.x + 80,
                top: selectedNodeDetails.y - 40,
            }}
        >
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
    );
}

DurationSelector.propTypes = {
    selectedNodeId: PropTypes.string,
    nodes: PropTypes.array.isRequired,
    edges: PropTypes.array.isRequired,
    setNodes: PropTypes.func.isRequired,
    setEdges: PropTypes.func.isRequired,
    getNextNodeId: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedNode: PropTypes.object.isRequired,
    updateNode: PropTypes.func.isRequired,
    selectedNodeDetails: PropTypes.object,
};
