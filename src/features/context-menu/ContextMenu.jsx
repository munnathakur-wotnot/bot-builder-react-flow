import React, { useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./ContextMenu.css";
import AppInput from "../../shared/ui/atoms/AppInput";
import { Icons, MENU_CATEGORIES } from "./contextMenuConfig";
import {
  bulkCreateFromSource,
  calculateMenuHeight,
  filterMenuCategories,
  getMenuSelectionPayload,
} from "./contextutils";

export default function ContextMenu({
  menuState,
  setMenuState,
  nodes,
  edges,
  setNodes,
  setEdges,
  getNextNodeId,
  nuberOfNodes,
  activeFlowId,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(null);
  const categoryRefs = useRef({});
  const listRef = useRef(null);
  const { menuHeight } = calculateMenuHeight(menuState.y);
  const filteredCategories = filterMenuCategories(MENU_CATEGORIES, searchQuery);

  const handleSelect = useCallback(
    (optionId) => {
      const result = getMenuSelectionPayload({
        optionId,
        menuState,
        nodes,
        getNextNodeId,
        activeFlowId,
      });

      if (!result) {
        setMenuState(null);
        return;
      }

      setNodes(result.nodes);
      setEdges([...edges, ...result.edges]);
      setMenuState(null);
    },
    [menuState, nodes, edges, setNodes, setEdges, getNextNodeId, setMenuState],
  );

  const bulkAddFromSource = useCallback(
    (optionId) => {
      const totalToAdd = Math.max(0, Number(nuberOfNodes || 0));

      if (totalToAdd <= 1) {
        handleSelect(optionId);
        return;
      }

      bulkCreateFromSource({
        optionId,
        menuState,
        nodes,
        edges,
        totalToAdd,
        getNextNodeId,
        activeFlowId,
        onComplete: ({ nodes, edges }) => {
          setNodes(nodes);
          setEdges(edges);
          setMenuState(null);
        },
      });
    },
    [
      menuState,
      nuberOfNodes,
      nodes,
      edges,
      getNextNodeId,
      handleSelect,
      setNodes,
      setEdges,
      setMenuState,
    ],
  );

  const handleOptionClick = useCallback(
    (optionId) => {
      if (nuberOfNodes > 1) bulkAddFromSource(optionId);
      else handleSelect(optionId);
    },
    [nuberOfNodes, bulkAddFromSource, handleSelect],
  );

  const scrollToCategory = useCallback((categoryId) => {
    const el = categoryRefs.current[categoryId];
    if (el && listRef.current) {
      listRef.current.scrollTo({
        top: el.offsetTop - listRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  }, []);

  if (!menuState) return null;

  return (
    <div
      className="context-menu"
      style={{ top: menuState.y, left: menuState.x, maxHeight: menuHeight, transform: "translateX(-50%)" }}
      role="menu"
    >
      <div className="context-menu__header">
        <span className="context-menu__search-icon">{Icons.search}</span>
        <AppInput
          className="context-menu__search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="context-menu__tabs">
        {MENU_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`context-menu__tab${activeTab === cat.id ? " context-menu__tab--active" : ""}`}
            style={
              activeTab === cat.id
                ? { borderColor: cat.color, color: cat.color }
                : {}
            }
            onClick={() => {
              setSearchQuery("");
              setActiveTab(cat.id);
              scrollToCategory(cat.id);
            }}
          >
            <span
              className="context-menu__tab-icon"
              style={activeTab === cat.id ? { color: cat.color } : {}}
            >
              {cat.tabIcon}
            </span>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="context-menu__list" ref={listRef}>
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            ref={(el) => {
              categoryRefs.current[cat.id] = el;
            }}
          >
            <p className="context-menu__category-label">{cat.label}</p>
            <div className="context-menu__options">
              {cat.options.map((option) => (
                <button
                  key={option.id}
                  className="context-menu__option"
                  type="button"
                  onClick={() => handleOptionClick(option.id)}
                >
                  <span
                    className="context-menu__option-icon"
                    style={{ background: option.color }}
                  >
                    {option.icon}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <p className="context-menu__empty">No results found</p>
        )}
      </div>
    </div>
  );
}

ContextMenu.propTypes = {
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
  getNextNodeId: PropTypes.func.isRequired,
  nuberOfNodes: PropTypes.number,
};

ContextMenu.defaultProps = {
  menuState: null,
};
