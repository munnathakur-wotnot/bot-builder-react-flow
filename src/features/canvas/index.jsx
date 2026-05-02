import { ReactFlowProvider } from "@xyflow/react";
import React from "react";
import CanvasFlow from "./Canvas";

export default function Canvas() {
    return (
        <ReactFlowProvider>
            <CanvasFlow />
        </ReactFlowProvider>
    );
}
