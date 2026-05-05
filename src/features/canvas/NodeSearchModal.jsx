import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import "./NodeSearchModal.css";
import { MENU_CATEGORIES } from "../context-menu/contextMenuConfig";

const CATEGORY_MAP = {};
MENU_CATEGORIES.forEach((cat) => {
  CATEGORY_MAP[cat.id] = { color: cat.color, label: cat.label };
});

export default function NodeSearchModal({ nodes, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchableNodes = nodes.filter(
    (n) => !n.data?.isSubNode && n.data?.title,
  );

  const filtered = search.trim()
    ? searchableNodes.filter(
        (n) =>
          n.data.title.toLowerCase().includes(search.toLowerCase()) ||
          n.data.iCategory?.toLowerCase().includes(search.toLowerCase()),
      )
    : searchableNodes;

  useEffect(() => {
    setHighlightIndex(0);
  }, [search]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((p) => Math.min(p + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((p) => Math.max(p - 1, 0));
      } else if (e.key === "Enter") {
        const node = filtered[highlightIndex];
        if (node) onSelect(node);
      }
    },
    [filtered, highlightIndex, onClose, onSelect],
  );

  return (
    <div className="node-search-overlay" onMouseDown={onClose}>
      <div
        className="node-search-modal"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="node-search-modal__header">
          <span className="node-search-modal__search-icon">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            ref={inputRef}
            className="node-search-modal__input"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="node-search-modal__esc" onClick={onClose}>
            ESC
          </span>
        </div>

        {/* List */}
        <div className="node-search-modal__list">
          {filtered.map((node, index) => {
            const cat = CATEGORY_MAP[node.data.iCategory];
            return (
              <button
                key={node.id}
                type="button"
                className={`node-search-modal__item${index === highlightIndex ? " node-search-modal__item--active" : ""}`}
                onClick={() => onSelect(node)}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                <span
                  className="node-search-modal__item-icon"
                  style={{ background: cat?.color ?? "#6b7280" }}
                >
                  {node.data.icon}
                </span>
                <span className="node-search-modal__item-title">
                  {node.data.title}
                </span>
                {cat && (
                  <span
                    className="node-search-modal__item-badge"
                    style={{
                      color: cat.color,
                      background: cat.color + "20",
                    }}
                  >
                    {cat.label}
                  </span>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="node-search-modal__empty">No nodes found</div>
          )}
        </div>
      </div>
    </div>
  );
}

NodeSearchModal.propTypes = {
  nodes: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
