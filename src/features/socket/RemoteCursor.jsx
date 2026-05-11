import React, { useEffect } from "react";
import "./remote-users.css";
import { cursorStore, useCursorStore } from "./useCursorStore";

export default function RemoteCursors() {
    useEffect(() => {
        cursorStore.init();
    }, []);
    const { cursors, me } = useCursorStore();

    return (
        <>
            {/* HEADER USERS */}
            <div className="global-users-header">
                {Object.values(cursors).map((user) => (
                    <div key={user.id} className="global-user-chip" title={user.name}>
                        <div
                            className="global-user-avatar"
                            style={{
                                background: user.color,
                            }}
                        >
                            {user.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <span>{user.name}</span>
                    </div>
                ))}
            </div>

            {/* CURSORS */}
            {Object.values(cursors)
                .filter((u) => u.id !== me?.id)
                .map((cursor) => (
                    <div
                        key={cursor.id}
                        style={{
                            position: "fixed",
                            left: cursor.x,
                            top: cursor.y,
                            pointerEvents: "none",
                            zIndex: 999999,
                            transition: "all 0.05s linear",
                            transform: "translate(-2px, -2px)",
                        }}
                    >
                        {/* cursor */}
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            style={{
                                filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))",
                            }}
                        >
                            <path
                                d="M5 3L19 12L12 14L14 21L10.5 22L8.5 15.5L5 18V3Z"
                                fill={cursor.color}
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                            />
                        </svg>

                        {/* label */}
                        <div
                            className="cursor-user-label"
                            style={{
                                background: cursor.color,
                            }}
                        >
                            <div className="cursor-avatar">
                                {cursor.name?.charAt(0)?.toUpperCase()}
                            </div>

                            <span>{cursor.name}</span>
                        </div>
                    </div>
                ))}
        </>
    );
}
