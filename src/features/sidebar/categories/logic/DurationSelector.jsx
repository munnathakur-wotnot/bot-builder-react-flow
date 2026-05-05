import React from "react";
import "./DurationSelector.css";
import PropTypes from "prop-types";

const durations = [1, 2, 5, 10];

export default function DurationSelector({ selectedNode, updateNode }) {
    const handleSelect = (value) => {
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
                        className={`duration-btn ${selectedNode?.data?.delayDuration === item ? "active" : ""}`}
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
