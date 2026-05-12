import React, { useEffect } from "react";
import RemoteCursor from "../features/socket/RemoteCursor";
import socket from "../features/socket/useSocket";
import Canvas from "../features/canvas";
import { throttle } from "lodash";

export default function App() {
  useEffect(() => {
    const userName =
      prompt("Enter Name") || `User-${Math.floor(Math.random() * 1000)}`;

    socket.emit("join-room", {
      roomId: "room-1",
      name: userName,
    });

    // throttle = every 50ms only one emit
    const handleMove = throttle((e) => {
      // When mouse is inside the canvas, Canvas.jsx emits flow coordinates.
      // Only emit screen coords here for outside-canvas areas (header, sidebar).
      if (e.target.closest?.(".flow-canvas")) return;
      socket.emit("cursor-move", {
        x: e.clientX,
        y: e.clientY,
        isFlow: false,
      });
    }, 50);

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);

      // cleanup throttle
      handleMove.cancel();
    };
  }, []);

  return (
    <>
      <RemoteCursor />
      <Canvas />
    </>
  );
}
