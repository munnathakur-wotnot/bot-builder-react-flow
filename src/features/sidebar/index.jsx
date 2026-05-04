import PropTypes from "prop-types";
import React from "react";
import { CATEGORY_CONFIGS } from "./utils/categoryConfigs";
import NodeSidebar from "./NodeSidebar";
import useNodeUpdater from "../../shared/hooks/useNodeUpdater";

export default function SidebarIndex({
    selectedNodeId,
    nodes,
    setNodes,
    onClose,
    ...rest // all other props (edges, setEdges, getNextNodeId, …) forwarded as-is
}) {
    const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
    const { updateNode } = useNodeUpdater({
        nodeId: selectedNode?.id,
        setNodes,
    });

    const iCategory = selectedNode?.data?.iCategory;
    const nodeType = selectedNode?.data?.type;
    const categoryConfig = CATEGORY_CONFIGS[iCategory];

    // Full prop set available to every category config:
    //   • spread ...rest   → any prop the parent passed through unchanged
    //   • explicit entries → props derived / owned by SidebarIndex (override rest if same key)
    const sidebarProps = {
        ...rest,
        selectedNodeId,
        nodes,
        setNodes,
        onClose,
        selectedNode, // derived — always the live object
        updateNode, // derived — stable updater for the selected node
    };

    // getSidebarComponent receives nodeType + the full prop set and returns
    // { Component, props } — each config decides which component and which props it needs.
    const { Component: RenderNodeClicker, props: componentProps } = categoryConfig
        ? categoryConfig.getSidebarComponent(nodeType, sidebarProps)
        : { Component: NodeSidebar, props: sidebarProps };

    return <RenderNodeClicker {...componentProps} />;
}

SidebarIndex.propTypes = {
    selectedNodeId: PropTypes.string,
    nodes: PropTypes.array.isRequired,
    edges: PropTypes.array.isRequired,
    setNodes: PropTypes.func.isRequired,
    setEdges: PropTypes.func.isRequired,
    getNextNodeId: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};
