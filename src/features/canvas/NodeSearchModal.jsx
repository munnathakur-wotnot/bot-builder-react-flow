import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import "./NodeSearchModal.css";
import { MENU_CATEGORIES } from "../context-menu/contextMenuConfig";

const CATEGORY_MAP = {};
MENU_CATEGORIES.forEach((cat) => {
  CATEGORY_MAP[cat.id] = { color: cat.color, label: cat.label };
});

const ITEM_HEIGHT = 46; // px — must match CSS (padding 9px*2 + icon 28px)
const LIST_MAX_HEIGHT = 380; // px — matches CSS max-height
const OVERSCAN = 3;

export default function NodeSearchModal({ nodes, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchableNodes = nodes.filter((n) => n.data?.title);

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

  // Auto-scroll list to keep highlighted item visible
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const itemTop = highlightIndex * ITEM_HEIGHT;
    const itemBottom = itemTop + ITEM_HEIGHT;
    if (itemTop < el.scrollTop) {
      el.scrollTop = itemTop;
    } else if (itemBottom > el.scrollTop + el.clientHeight) {
      el.scrollTop = itemBottom - el.clientHeight;
    }
  }, [highlightIndex]);

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

  // Virtual list: only render items in the visible window + overscan
  const totalHeight = filtered.length * ITEM_HEIGHT;
  const containerHeight = Math.min(totalHeight, LIST_MAX_HEIGHT);
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN,
  );
  const endIndex = Math.min(
    filtered.length - 1,
    Math.ceil((scrollTop + LIST_MAX_HEIGHT) / ITEM_HEIGHT) + OVERSCAN,
  );
  const visibleItems = filtered.slice(startIndex, endIndex + 1);

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

        {/* Virtualized list — only rendered when there are results */}
        {filtered.length === 0 ? (
          <div className="node-search-modal__empty">No nodes found</div>
        ) : (
          <div
            ref={listRef}
            className="node-search-modal__list"
            style={{ height: containerHeight }}
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          >
            <div style={{ height: totalHeight, position: "relative" }}>
              {visibleItems.map((node, idx) => {
                const index = startIndex + idx;
                const cat = CATEGORY_MAP[node.data.iCategory];
                return (
                  <button
                    key={node.id}
                    type="button"
                    className={`node-search-modal__item${index === highlightIndex ? " node-search-modal__item--active" : ""}`}
                    style={{
                      position: "absolute",
                      top: index * ITEM_HEIGHT,
                      left: 0,
                      right: 0,
                    }}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

NodeSearchModal.propTypes = {
  nodes: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
