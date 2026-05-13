import PropTypes from "prop-types";
import React from "react";
import "./CustomNode.css";

function formatRelativeTime(ts) {
    if (!ts) return "";

    const diffMs = Date.now() - ts;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHr = Math.floor(diffMin / 60);

    if (diffHr < 24) return `${diffHr}h ago`;

    return `${Math.floor(diffHr / 24)}d ago`;
}

function NodeFooter({ data }) {
    if (!data.lastUpdatedBy && !data.createdBy) {
        return null;
    }

    const user = data.lastUpdatedBy || data.createdBy;

    return (
        <div className="custom-node__activity-footer">
            <span
                className="custom-node__activity-chip"
                style={{ borderColor: user.color }}
            >
                <span
                    className="custom-node__activity-avatar"
                    style={{ background: user.color }}
                >
                    {user.name?.[0]?.toUpperCase()}
                </span>

                <span className="custom-node__activity-label">
                    {data.lastUpdatedBy
                        ? `${user.name} · ${formatRelativeTime(user.at)}`
                        : `${user.name} · created`}
                </span>
            </span>
        </div>
    );
}

NodeFooter.propTypes = {
    data: PropTypes.object,
};

export default React.memo(NodeFooter);
