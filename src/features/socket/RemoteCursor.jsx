import React, { useEffect, useState } from "react";
import socket from "./useSocket";
import "./remote-users.css";

export default function RemoteCursors() {
    const [cursors, setCursors] = useState({});
    const [me, setMe] = useState(null);

    useEffect(() => {
        // current me
        socket.on("me", (user) => {
            setMe(user);

            setCursors((prev) => ({
                ...prev,
                [user.id]: user,
            }));
        });

        // existing users
        socket.on("existing-users", (users) => {
            const map = {};

            users.forEach((user) => {
                map[user.id] = user;
            });

            setCursors((prev) => ({
                ...prev,
                ...map,
            }));
        });

        // new joined
        socket.on("user-joined", (user) => {
            setCursors((prev) => ({
                ...prev,
                [user.id]: user,
            }));
        });

        // move
        socket.on("cursor-move", (user) => {
            setCursors((prev) => ({
                ...prev,
                [user.id]: {
                    ...prev[user.id],
                    ...user,
                },
            }));
        });

        // remove
        socket.on("user-left", (userId) => {
            setCursors((prev) => {
                const copy = { ...prev };

                delete copy[userId];

                return copy;
            });
        });

        return () => {
            socket.off("me");
            socket.off("existing-users");
            socket.off("user-joined");
            socket.off("cursor-move");
            socket.off("user-left");
        };
    }, []);

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
