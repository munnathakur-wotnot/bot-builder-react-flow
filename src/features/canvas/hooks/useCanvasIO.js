import { useCallback, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import { importMigration, exportMigration } from "../migrationUtils";

/**
 * Handles JSON import / export for the canvas.
 * Supports both:
 *   • New format  { nodes[], edges[] }
 *   • Old format  { nodes[], links[] }  ← auto-detected, migrated on the fly
 *
 * Returns { importFileRef, handleImportChange, triggerImport, handleExport, handleExportLegacy }
 */
export function useCanvasIO({ nodes, edges, setNodes, setEdges }) {
  const { fitView } = useReactFlow();
  const importFileRef = useRef(null);

  /* ── EXPORT (new format) ──────────────────────────────────── */
  const handleExport = useCallback(() => {
    const json = JSON.stringify({ nodes, edges }, null, 2);
    triggerDownload(json, "flow.json");
  }, [nodes, edges]);

  /* ── EXPORT LEGACY (old port-based format) ────────────────── */
  const handleExportLegacy = useCallback(
    (meta = {}) => {
      const oldJson = exportMigration(nodes, edges, meta);
      const json = JSON.stringify(oldJson, null, 2);
      triggerDownload(json, "flow_legacy.json");
    },
    [nodes, edges],
  );

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
            // ── OLD FORMAT: has "links" array → migrate it
            ({ nodes: nextNodes, edges: nextEdges } = importMigration(parsed));
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
    [setNodes, setEdges, fitView],
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
    handleExportLegacy,
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
