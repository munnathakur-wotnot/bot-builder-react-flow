import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Command } from "cmdk";
import "./NodeSearchModal.css";
import { MENU_CATEGORIES } from "../context-menu/contextMenuConfig";

const CATEGORY_MAP = {};

MENU_CATEGORIES.forEach((cat) => {
  CATEGORY_MAP[cat.id] = {
    color: cat.color,
    label: cat.label,
  };
});

export default function NodeSearchModal({ open, nodes, onSelect, onClose }) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="node-search-overlay" onMouseDown={onClose}>
      <div
        className="node-search-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Command className="node-search-command">
          {/* Header */}
          <div className="node-search-header">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="node-search-icon"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <Command.Input
              autoFocus
              placeholder="Search nodes..."
              className="node-search-input"
            />

            <button type="button" className="node-search-esc" onClick={onClose}>
              ESC
            </button>
          </div>

          {/* Results */}
          <Command.List className="node-search-list">
            <Command.Empty className="node-search-empty">
              No nodes found
            </Command.Empty>

            <Command.Group heading="Nodes">
              {nodes
                .filter((n) => n.data?.extras?.config?.title ?? n.data?.title)
                .map((node) => {
                  const cat = CATEGORY_MAP[node.data.iCategory];

                  return (
                    <Command.Item
                      key={node.id}
                      value={`${node.data.extras?.config?.title ?? node.data.title ?? ""} ${node.data.iCategory || ""}`}
                      onSelect={() => onSelect(node)}
                      className="node-search-item"
                    >
                      <span
                        className="node-search-item-icon"
                        style={{
                          background: cat?.color ?? "#6b7280",
                        }}
                      >
                        {node.data.icon}
                      </span>

                      <span className="node-search-item-title">
                        {node.data.extras?.config?.title ?? node.data.title}
                      </span>

                      {cat && (
                        <span
                          className="node-search-item-badge"
                          style={{
                            color: cat.color,
                            background: `${cat.color}20`,
                          }}
                        >
                          {cat.label}
                        </span>
                      )}
                    </Command.Item>
                  );
                })}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

NodeSearchModal.propTypes = {
  open: PropTypes.bool.isRequired,
  nodes: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
