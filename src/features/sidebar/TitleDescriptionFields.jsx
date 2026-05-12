import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import useDebouncedCallback from "../../shared/hooks/useDebouncedCallback";
import AppInput from "../../shared/ui/atoms/AppInput";
import AppTextarea from "../../shared/ui/atoms/AppTextArea";
import { getMeStamp } from "../socket/useCursorStore.js";

export default function TitleDescriptionFields({
  nodeData,
  updateNode,
  remoteTypingMap,
  emitTypingStart,
  emitTypingEnd,
}) {
  const [title, setTitle] = useState(nodeData.title ?? "");
  const [description, setDescription] = useState(nodeData.description ?? "");

  const lastCommittedRef = useRef({
    title: nodeData.title ?? "",
    description: nodeData.description ?? "",
  });

  const { debounced: debouncedUpdateNode, cancel: cancelDebouncedUpdateNode } =
    useDebouncedCallback(updateNode, 200);

  // ─────────────────────────────────────────────
  // Remote typing users
  // ─────────────────────────────────────────────

  const titleTypingUser = remoteTypingMap?.[nodeData.id]?.title;

  const descriptionTypingUser = remoteTypingMap?.[nodeData.id]?.description;

  const isTitleLocked = !!titleTypingUser;
  const isDescriptionLocked = !!descriptionTypingUser;

  // ─────────────────────────────────────────────
  // Sync selected node
  // ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  // Debounced graph update
  // ─────────────────────────────────────────────

  useEffect(() => {
    const last = lastCommittedRef.current;

    const patch = {};

    if (title !== last.title) {
      patch.title = title;
    }

    if (description !== last.description) {
      patch.description = description;
    }

    if (Object.keys(patch).length === 0) {
      return;
    }

    patch.lastUpdatedBy = getMeStamp();

    debouncedUpdateNode(patch);

    lastCommittedRef.current = {
      ...lastCommittedRef.current,
      ...patch,
    };
  }, [title, description, debouncedUpdateNode]);

  // ─────────────────────────────────────────────
  // Cleanup typing locks on unmount
  // ─────────────────────────────────────────────

  useEffect(() => {
    return () => {
      emitTypingEnd(nodeData.id, "title");
      emitTypingEnd(nodeData.id, "description");
    };
  }, [nodeData.id, emitTypingEnd]);

  return (
    <>
      {/* TITLE */}

      <label className="node-sidebar__label">
        Title
        <AppInput
          disabled={isTitleLocked}
          className={`node-sidebar__input${!title.trim() ? " node-sidebar__input--error" : ""
            }`}
          value={title}
          onFocus={() => emitTypingStart(nodeData.id, "title")}
          onBlur={() => emitTypingEnd(nodeData.id, "title")}
          onChange={(e) => setTitle(e.target.value)}
        />
        {!title.trim() && (
          <span className="node-sidebar__field-error">Title is required</span>
        )}
        {titleTypingUser && (
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              fontWeight: 600,
              color: titleTypingUser.color,
            }}
          >
            {titleTypingUser.name} is typing title...
          </div>
        )}
      </label>

      {/* DESCRIPTION */}

      <AppTextarea
        disabled={isDescriptionLocked}
        className={`node-sidebar__textarea${!description.trim() ? " node-sidebar__textarea--error" : ""
          }`}
        label={"Description"}
        value={description}
        onFocus={() => emitTypingStart(nodeData.id, "description")}
        onBlur={() => emitTypingEnd(nodeData.id, "description")}
        onChange={(e) => setDescription(e.target.value)}
        error={!description.trim() ? "Description is required" : ""}
      />

      {descriptionTypingUser && (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            fontWeight: 600,
            color: descriptionTypingUser.color,
          }}
        >
          {descriptionTypingUser.name} is typing description...
        </div>
      )}
    </>
  );
}

TitleDescriptionFields.propTypes = {
  nodeData: PropTypes.object,
  updateNode: PropTypes.func,

  remoteTypingMap: PropTypes.object,

  emitTypingStart: PropTypes.func,
  emitTypingEnd: PropTypes.func,
};
