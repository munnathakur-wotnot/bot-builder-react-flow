import React, { useState, useEffect } from "react";
import "./DurationSelector.css";
import PropTypes from "prop-types";

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
        <div>
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
    selectedNode: PropTypes.object.isRequired,
    updateNode: PropTypes.func.isRequired,
};
