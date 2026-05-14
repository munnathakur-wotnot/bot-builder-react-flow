import React from "react";
import "./JumpCard.css";
import CustomSelect from "../../../../shared/ui/atoms/CustumSelect";
import PropTypes from "prop-types";
export default function JumpSelector({ nodes, selectedNode, updateNode }) {
    const filterOptions = nodes?.filter(
        (node) => (node.data.metaType ?? node.data.type) !== "start" && node.id !== selectedNode.id,
    );

    const options = filterOptions.map((node) => ({
        label: node.data.extras?.config?.title ?? node.data.title,
        value: node.id,
    }));

    return (
        <div className="jump-card">
            <p className="jump-card__desc">
                Jumps the conversation flow form this point to the selected action
                block.
            </p>

            <div className="jump-card__field">
                <label>Title</label>
                <input type="text" value="Jump 4" readOnly />
            </div>

            <div className="jump-card__field">
                <CustomSelect
                    options={options}
                    value={{
                        value: selectedNode.data?.jumpNode?.id,
                        label: selectedNode.data?.jumpNode?.title,
                    }}
                    onChange={(val) =>
                        updateNode({ jumpNode: { id: val.value, title: val.label } })
                    }
                />
            </div>
        </div>
    );
}

JumpSelector.propTypes = {
    nodes: PropTypes.array,
    selectedNode: PropTypes.object,
    updateNode: PropTypes.func,
};
