import PropTypes from "prop-types";
import React from "react";
import { menuRendering } from "./contextutils";

export default function ConextMenuIndex(props) {
    const { menuState } = props;

    const { compoent: Component, props: componentProps } = menuRendering(
        menuState,
        props,
    );
    return <Component {...componentProps} />;
}

ConextMenuIndex.propTypes = {
    menuState: PropTypes.shape({
        nodeId: PropTypes.string,
        x: PropTypes.number,
        y: PropTypes.number,
        type: PropTypes.string,
    }),
    setMenuState: PropTypes.func.isRequired,
    nodes: PropTypes.array.isRequired,
    edges: PropTypes.array.isRequired,
    setNodes: PropTypes.func.isRequired,
    setEdges: PropTypes.func.isRequired,
    setSelectedNodeId: PropTypes.func.isRequired,
    getNextNodeId: PropTypes.func.isRequired,
    nuberOfNodes: PropTypes.number,
};

ConextMenuIndex.defaultProps = {
    menuState: null,
};
