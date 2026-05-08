import React, { useEffect, useState } from "react";
import socket from "./useSocket";

const randomColor = () => {
    const colors = [
        "#1677ff",
        "#52c41a",
        "#fa8c16",
        "#722ed1",
        "#eb2f96",
        "#13c2c2",
        "#2f54eb",
        "#a0d911",
    ];

    return colors[Math.floor(Math.random() * colors.length)];
};

export default function RemoteCursors() {
    const [cursors, setCursors] = useState({});

    useEffect(() => {
        // existing users
        socket.on("existing-users", (users) => {
            const map = {};

            users.forEach((user) => {
                map[user.id] = {
                    ...user,
                    color: user.color || randomColor(),
                };
            });

            setCursors(map);
        });

        // new user
        socket.on("user-joined", (user) => {
            setCursors((prev) => ({
                ...prev,
                [user.id]: {
                    ...user,
                    color: user.color || randomColor(),
                },
            }));
        });

        // move
        socket.on("cursor-move", (user) => {
            setCursors((prev) => ({
                ...prev,
                [user.id]: {
                    ...prev[user.id],
                    ...user,
                    color: prev[user.id]?.color || randomColor(),
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
            socket.off("existing-users");
            socket.off("user-joined");
            socket.off("cursor-move");
            socket.off("user-left");
        };
    }, []);

    return (
        <>
            {Object.values(cursors).map((cursor) => (
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
                    {/* cursor arrow */}
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

                    {/* user label */}
                    <div
                        style={{
                            marginTop: 2,
                            marginLeft: 14,
                            background: cursor.color,
                            color: "#fff",
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            width: "fit-content",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            fontFamily: "sans-serif",
                        }}
                    >
                        {cursor.name}
                    </div>
                </div>
            ))}
        </>
    );
}
