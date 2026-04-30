import PropTypes from "prop-types";
import React, { useCallback } from "react";
export default function SidebarHeader({ setLayerStack, layerIndex, onClose }) {
    const handleBack = useCallback(() => {
        setLayerStack((prev) => prev.slice(0, -1));
    }, []);

    return (
        <div className="node-sidebar__header">
            {layerIndex > 0 ? (
                <button
                    type="button"
                    className="node-sidebar__back"
                    onClick={handleBack}
                    aria-label="Back"
                >
                    ‹ Back
                </button>
            ) : (
                <h3 className="node-sidebar__title">Node Config</h3>
            )}
            <button
                type="button"
                className="node-sidebar__close"
                onClick={onClose}
                aria-label="Close sidebar"
            >
                ×
            </button>
        </div>
    );
}

SidebarHeader.propTypes = {
    setLayerStack: PropTypes.func,
    layerIndex: PropTypes.number,
    onClose: PropTypes.func,
};
