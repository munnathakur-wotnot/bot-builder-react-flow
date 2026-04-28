import React, { useCallback } from "react";
import PropTypes from "prop-types";
import AddButton from "./AddButton";
import FormConfig from "./FormFields";
import { handleAddCarousel, handleAddForm } from "./helper";

const NODE_ACTIONS = {
    carousel: handleAddCarousel,
    form: handleAddForm,
};

const NODE_UI = {
    carousel: {
        component: null,
        buttonText: "Add Card",
    },
    form: {
        component: FormConfig,
        buttonText: "Add Field",
    },
};

export default function SidebarChecker(props) {
    const {
        nodeType,
        selectedNode,
        setNodes,
        setEdges,
        getNextNodeId,
        updateNode,
        nodeData,
    } = props;

    const handleAddButton = useCallback(() => {
        const action = NODE_ACTIONS[nodeType];
        if (!action) return;

        action({
            selectedNode,
            getNextNodeId,
            setNodes,
            setEdges,
            updateNode,
            nodeData,
        });
    }, [
        nodeType,
        selectedNode,
        getNextNodeId,
        setNodes,
        setEdges,
        updateNode,
        nodeData,
    ]);

    const config = NODE_UI[nodeType];
    if (!config) return null;

    const Component = config.component;

    return (
        <>
            {Component && <Component {...props} />}
            <AddButton handleAddButton={handleAddButton} text={config.buttonText} />
        </>
    );
}

SidebarChecker.propTypes = {
    nodeType: PropTypes.string,
    selectedNode: PropTypes.object,
    setNodes: PropTypes.func.isRequired,
    setEdges: PropTypes.func.isRequired,
    getNextNodeId: PropTypes.func.isRequired,
    updateNode: PropTypes.func.isRequired,
    nodeData: PropTypes.object,
};
