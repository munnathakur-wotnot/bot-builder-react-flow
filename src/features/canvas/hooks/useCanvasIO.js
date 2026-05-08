import { useCallback, useRef } from "react";
import { useReactFlow } from "@xyflow/react";

/**
 * Handles JSON import / export for the canvas.
 * Returns { importFileRef, handleImport, handleExport }
 */
export function useCanvasIO({ nodes, edges, setNodes, setEdges }) {
  const { fitView } = useReactFlow();
  const importFileRef = useRef(null);

  const handleExport = useCallback(() => {
    const json = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleImportChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
            alert('Invalid flow JSON: must have "nodes" and "edges" arrays.');
            return;
          }
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          requestAnimationFrame(() => fitView({ padding: 0.2, duration: 400 }));
        } catch {
          alert("Failed to parse JSON file.");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [setNodes, setEdges, fitView],
  );

  const triggerImport = useCallback(() => {
    importFileRef.current?.click();
  }, []);

  return { importFileRef, handleImportChange, triggerImport, handleExport };
}
