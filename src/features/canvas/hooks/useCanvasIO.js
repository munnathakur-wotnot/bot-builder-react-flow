import { useCallback, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import { migrateToReactFlow, migrateFromReactFlow } from "../orliginalMigrate";

/**
 * Handles JSON import / export for the canvas.
 * Supports both:
 *   • New format  { nodes[], edges[] }
 *   • Old format  { nodes[], links[] }  ← auto-detected, migrated on the fly
 *
 * Returns { importFileRef, handleImportChange, triggerImport, handleExport }
 */
export function useCanvasIO({
  nodes,
  edges,
  setNodes,
  setEdges,
  setStartChecking,
  flowMetaRef,
  getViewport,
}) {
  const { fitView } = useReactFlow();
  const importFileRef = useRef(null);

  /* ── EXPORT (old format via migrateFromReactFlow) ─────────── */
  const handleExport = useCallback(() => {
    const viewport = getViewport?.() ?? { x: 0, y: 0, zoom: 1 };
    const rfFlow = {
      ...flowMetaRef.current,
      nodes,
      edges,
      viewport,
    };

    // ── timed: migration ──────────────────────────────────────
    const t0migrate = performance.now();
    const oldJson = migrateFromReactFlow(rfFlow);
    const t1migrate = performance.now();
    console.log(`[Export] migrateFromReactFlow: ${(t1migrate - t0migrate).toFixed(2)}ms`);

    // ── timed: JSON serialise + download ──────────────────────
    const t0serial = performance.now();
    const jsonString = JSON.stringify(oldJson, null, 2);
    const t1serial = performance.now();
    console.log(`[Export] JSON.stringify (no migration): ${(t1serial - t0serial).toFixed(2)}ms`);

    console.log(
      `[Export] Total: ${(t1serial - t0migrate).toFixed(2)}ms` +
      ` | nodes=${nodes.length} edges=${edges.length}`,
    );

    triggerDownload(jsonString, "flow.json");
  }, [nodes, edges, flowMetaRef, getViewport]);

  /* ── IMPORT (auto-detects old vs new format) ──────────────── */
  const handleImportChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);

          let nextNodes, nextEdges;

          if (Array.isArray(parsed.links)) {
            setStartChecking(true);
            console.log(parsed, "data-p");

            const start = performance.now();

            // Preserve top-level metadata (id, version, gridSize, extraInfo, etc.)
            // so it can be round-tripped back on export
            const { nodes: _n, links: _l, offsetX: _ox, offsetY: _oy, zoom: _z, ...meta } = parsed;
            if (flowMetaRef) flowMetaRef.current = meta;

            ({ nodes: nextNodes, edges: nextEdges } =
              migrateToReactFlow(parsed));

            console.log(nextEdges, nextNodes, "Vlaue");

            const end = performance.now();

            console.log(
              `migrateToReactFlow took ${(end - start).toFixed(2)}ms`,
            );
          } else if (
            Array.isArray(parsed.nodes) &&
            Array.isArray(parsed.edges)
          ) {
            // ── NEW FORMAT: use as-is
            nextNodes = parsed.nodes;
            nextEdges = parsed.edges;
          } else {
            alert(
              "Invalid flow JSON: expected { nodes, edges } or legacy { nodes, links }.",
            );
            return;
          }

          setNodes(nextNodes);
          setEdges(nextEdges);
          requestAnimationFrame(() => fitView({ padding: 0.2, duration: 400 }));
        } catch (err) {
          console.error("Import failed:", err);
          alert("Failed to parse JSON file.");
        }
      };

      reader.readAsText(file);
      e.target.value = "";
    },
    [setNodes, setEdges, fitView, setStartChecking, flowMetaRef],
  );

  /* ── TRIGGER file picker ──────────────────────────────────── */
  const triggerImport = useCallback(() => {
    importFileRef.current?.click();
  }, []);

  return {
    importFileRef,
    handleImportChange,
    triggerImport,
    handleExport,
  };
}

/* ── internal helper ────────────────────────────────────────── */
function triggerDownload(jsonString, filename) {
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
