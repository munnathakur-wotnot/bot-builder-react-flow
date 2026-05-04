import React from "react";
import { useFlowCallbacks } from "../canvas/FlowCallbacksContext";
import {
  CloneIcon,
  CopyIcon,
  DeleteIcon,
} from "../../shared/ui/atoms/icons.jsx";
import PropTypes from "prop-types";

export default function NodeTooltips({ id }) {
  const { deleteNode, copyNode, cloneNode } = useFlowCallbacks();

  return (
    <div className="node-toolbar" role="toolbar" aria-label="Node actions">
      <button
        type="button"
        className="node-toolbar__btn"
        title="Copy"
        onClick={(e) => {
          e.stopPropagation();
          copyNode(id);
        }}
      >
        <CopyIcon />
      </button>
      <button
        type="button"
        className="node-toolbar__btn"
        title="Clone"
        onClick={(e) => {
          e.stopPropagation();
          cloneNode(id);
        }}
      >
        <CloneIcon />
      </button>
      <button
        type="button"
        className="node-toolbar__btn node-toolbar__btn--danger"
        title="Delete"
        onClick={(e) => {
          e.stopPropagation();
          deleteNode(id);
        }}
      >
        <DeleteIcon />
      </button>
    </div>
  );
}

NodeTooltips.propTypes = {
  id: PropTypes.string.isRequired,
};
