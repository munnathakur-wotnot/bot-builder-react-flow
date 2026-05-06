import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import useDebouncedCallback from "../../shared/hooks/useDebouncedCallback";
import AppInput from "../../shared/ui/atoms/AppInput";
import AppTextarea from "../../shared/ui/atoms/AppTextArea";

export default function TitleDescriptionFields({ nodeData, updateNode }) {
  const [title, setTitle] = useState(nodeData.title ?? "");
  const [description, setDescription] = useState(nodeData.description ?? "");
  const lastCommittedRef = useRef({
    title: nodeData.title ?? "",
    description: nodeData.description ?? "",
  });
  const { debounced: debouncedUpdateNode, cancel: cancelDebouncedUpdateNode } =
    useDebouncedCallback(updateNode, 200);

  // Keep local inputs in sync when switching selected nodes.
  useEffect(() => {
    const nextTitle = nodeData.title ?? "";
    const nextDescription = nodeData.description ?? "";
    setTitle(nextTitle);
    setDescription(nextDescription);
    lastCommittedRef.current = {
      title: nextTitle,
      description: nextDescription,
    };
    cancelDebouncedUpdateNode();
  }, [nodeData.title, nodeData.description, cancelDebouncedUpdateNode]);

  // Debounce committing to the graph state to avoid re-rendering the whole flow on every keystroke.
  useEffect(() => {
    const last = lastCommittedRef.current;
    const patch = {};

    if (title !== last.title) patch.title = title;
    if (description !== last.description) patch.description = description;

    if (Object.keys(patch).length === 0) return;

    debouncedUpdateNode(patch);
    lastCommittedRef.current = { ...lastCommittedRef.current, ...patch };
  }, [title, description, debouncedUpdateNode]);

  return (
    <>
      <label className="node-sidebar__label">
        Title
        <AppInput
          className={`node-sidebar__input${!title.trim() ? " node-sidebar__input--error" : ""}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {!title.trim() && (
          <span className="node-sidebar__field-error">Title is required</span>
        )}
      </label>
      <AppTextarea
        className={`node-sidebar__textarea${!description.trim() ? " node-sidebar__textarea--error" : ""}`}
        label={"Description"}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={!description.trim() ? "Description is required" : ""}
      />
    </>
  );
}

TitleDescriptionFields.propTypes = {
  nodeData: PropTypes.object,
  updateNode: PropTypes.func,
};
