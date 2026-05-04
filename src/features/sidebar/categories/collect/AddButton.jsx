import React from "react";
import PropTypes from "prop-types";

export default function AddButton({ handleAddButton, text }) {
    return (
        <button
            type="button"
            className="node-sidebar__add-card-button"
            onClick={handleAddButton}
        >
            + {text}
        </button>
    );
}

AddButton.propTypes = {
    handleAddButton: PropTypes.func,
    text: PropTypes.string,
};
