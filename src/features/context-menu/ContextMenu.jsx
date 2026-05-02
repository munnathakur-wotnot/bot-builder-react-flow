import React, { useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./ContextMenu.css";
import { buildMenuActionMap } from "../canvas/utils";
import { MENU_NODE_TEMPLATES } from "../canvas/constants";
import AppInput from "../../shared/ui/atoms/AppInput";
import { Icons, MENU_CATEGORIES } from "./contextMenuConfig";



export default function ContextMenu({
  menuState,
  setMenuState,
  nodes,
  edges,
  setNodes,
  setEdges,
  setSelectedNodeId,
  getNextNodeId,
  nuberOfNodes,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(null);
  const categoryRefs = useRef({});
  const listRef = useRef(null);

  const handleSelect = useCallback(
    (optionId) => {
      if (!menuState?.nodeId) return;

      const sourceNode = nodes.find((n) => n.id === menuState.nodeId);
      if (!sourceNode) return;

      const actionByOption = buildMenuActionMap({
        context: {
          sourceNode,
          sourceNodeId: menuState.nodeId,
          allNodes: nodes,
        },
        templates: MENU_NODE_TEMPLATES,
        getNextNodeId,
        sourceHandle: menuState.type,
      });

      const buildPayload = actionByOption[optionId];
      if (!buildPayload) {
        setMenuState(null);
        return;
      }

      const payload = buildPayload();
      const directTargets = payload.edgesToAdd
        .filter((edge) => edge.source === sourceNode.id)
        .map((edge) => edge.target);

      const nextNodes = nodes.map((node) => {
        if (node.id !== sourceNode.id) return node;

        let updatedData = { ...node.data };

        if (menuState.type === "success") {
          const existing = node.data.successOutport || [];
          updatedData.successOutport = Array.from(new Set([...existing, ...directTargets]));
        } else if (menuState.type === "failure") {
          const existing = node.data.failureOutport || [];
          updatedData.failureOutport = Array.from(new Set([...existing, ...directTargets]));
        } else {
          const existing = node.data.outPorts || [];
          updatedData.outPorts = Array.from(new Set([...existing, ...directTargets]));
        }

        return {
          ...node,
          data: {
            ...updatedData,
            connected:
              (updatedData.outPorts?.length || 0) > 0 ||
              (updatedData.successOutport?.length || 0) > 0 ||
              (updatedData.failureOutport?.length || 0) > 0,
          },
        };
      });

      setNodes([...nextNodes, ...payload.nodesToAdd]);
      setEdges([...edges, ...payload.edgesToAdd]);
      setSelectedNodeId(payload.selectedNodeId);
      setMenuState(null);
    },
    [menuState, nodes, edges, setNodes, setEdges, setSelectedNodeId, getNextNodeId, setMenuState],
  );

  const bulkAddFromSource = useCallback(
    (optionId) => {
      const sourceNodeId = menuState?.nodeId;
      if (!sourceNodeId) return;

      const totalToAdd = Math.max(0, Number(nuberOfNodes || 0));
      if (totalToAdd <= 1) {
        handleSelect(optionId);
        return;
      }

      let workingNodes = nodes;
      let workingEdges = edges;
      let created = 0;
      let finalSelectedNodeId = null;
      const batchSize = 25;
      let aborted = false;

      const runBatch = () => {
        const batchLimit = Math.min(batchSize, totalToAdd - created);

        for (let i = 0; i < batchLimit; i++) {
          const sourceNode = workingNodes.find((n) => n.id === sourceNodeId);
          if (!sourceNode) { aborted = true; break; }

          const actionByOption = buildMenuActionMap({
            context: { sourceNode, sourceNodeId, allNodes: workingNodes },
            templates: MENU_NODE_TEMPLATES,
            getNextNodeId,
          });

          const buildPayload = actionByOption[optionId];
          if (!buildPayload) { aborted = true; break; }

          const payload = buildPayload();
          if (!payload) { aborted = true; break; }

          const directTargets = (payload.edgesToAdd || [])
            .filter((edge) => edge.source === sourceNodeId)
            .map((edge) => edge.target);

          const nextNodes = workingNodes.map((node) => {
            if (node.id !== sourceNodeId) return node;
            const existingOutPorts = node.data?.outPorts || [];
            const mergedOutPorts = Array.from(new Set([...existingOutPorts, ...directTargets]));
            return { ...node, data: { ...node.data, outPorts: mergedOutPorts, connected: mergedOutPorts.length > 0 } };
          });

          workingNodes = [...nextNodes, ...(payload.nodesToAdd || [])];
          workingEdges = [...workingEdges, ...(payload.edgesToAdd || [])];
          finalSelectedNodeId = payload.selectedNodeId || finalSelectedNodeId;
          created++;
        }

        if (!aborted && created < totalToAdd) {
          requestAnimationFrame(runBatch);
          return;
        }

        setNodes(workingNodes);
        setEdges(workingEdges);
        if (finalSelectedNodeId) setSelectedNodeId(finalSelectedNodeId);
        setMenuState(null);
      };

      runBatch();
    },
    [menuState, nuberOfNodes, nodes, edges, getNextNodeId, handleSelect, setNodes, setEdges, setSelectedNodeId, setMenuState],
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
      listRef.current.scrollTo({ top: el.offsetTop - listRef.current.offsetTop, behavior: "smooth" });
    }
  }, []);

  const lowerQuery = searchQuery.toLowerCase().trim();
  const filteredCategories = MENU_CATEGORIES.map((cat) => ({
    ...cat,
    options: cat.options.filter((opt) => !lowerQuery || opt.label.toLowerCase().includes(lowerQuery)),
  })).filter((cat) => cat.options.length > 0);

  if (!menuState) return null;

  return (
    <div className="context-menu" style={{ top: menuState.y, left: menuState.x }} role="menu">
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
            style={activeTab === cat.id ? { borderColor: cat.color, color: cat.color } : {}}
            onClick={() => {
              setSearchQuery("");
              setActiveTab(cat.id);
              scrollToCategory(cat.id);
            }}
          >
            <span className="context-menu__tab-icon" style={activeTab === cat.id ? { color: cat.color } : {}}>
              {cat.tabIcon}
            </span>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="context-menu__list" ref={listRef}>
        {filteredCategories.map((cat) => (
          <div key={cat.id} ref={(el) => { categoryRefs.current[cat.id] = el; }}>
            <p className="context-menu__category-label">{cat.label}</p>
            <div className="context-menu__options">
              {cat.options.map((option) => (
                <button
                  key={option.id}
                  className="context-menu__option"
                  type="button"
                  onClick={() => handleOptionClick(option.id)}
                >
                  <span className="context-menu__option-icon" style={{ background: option.color }}>
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
  setSelectedNodeId: PropTypes.func.isRequired,
  getNextNodeId: PropTypes.func.isRequired,
  nuberOfNodes: PropTypes.number,
};

ContextMenu.defaultProps = {
  menuState: null,
};