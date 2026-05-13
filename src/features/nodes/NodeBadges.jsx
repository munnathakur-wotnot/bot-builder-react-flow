import React from "react";
import PropTypes from "prop-types";
import "./CustomNode.css";

function NodeBadges({ data }) {
    const {
        selectedBy,
        selectedByColor,
        isDraggedBy,
        isDraggedByColor,
        isMenuOpenBy,
        isMenuOpenByColor,
    } = data;

    return (
        <>
            {isDraggedBy && (
                <>
                    <div className="custom-node__drag-lock-overlay" />

                    <div
                        className="custom-node__remote-user-badge
              custom-node__remote-user-badge--dragging"
                        style={{ background: isDraggedByColor }}
                    >
                        ✦ {isDraggedBy} is dragging
                    </div>
                </>
            )}

            {!isDraggedBy && isMenuOpenBy && (
                <div
                    className="custom-node__remote-user-badge
            custom-node__remote-user-badge--menu"
                    style={{ background: isMenuOpenByColor }}
                >
                    ☰ {isMenuOpenBy} has menu open
                </div>
            )}

            {!isDraggedBy && !isMenuOpenBy && selectedBy && (
                <div
                    className="custom-node__remote-user-badge"
                    style={{ background: selectedByColor }}
                >
                    {selectedBy}
                </div>
            )}
        </>
    );
}

NodeBadges.propTypes = {
    data: PropTypes.shape({
        selectedBy: PropTypes.string,
        selectedByColor: PropTypes.string,
        isDraggedBy: PropTypes.string,
        isDraggedByColor: PropTypes.string,
        isMenuOpenBy: PropTypes.string,
        isMenuOpenByColor: PropTypes.string,
    }).isRequired,
};

export default React.memo(NodeBadges);
