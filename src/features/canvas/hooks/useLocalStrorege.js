import { useCallback } from "react";

export const useLocalStorage = () => {
  // GET
  const getNodesEdges = useCallback(() => {
    try {
      const nodes = JSON.parse(localStorage.getItem("nodes") || "[]");

      const edges = JSON.parse(localStorage.getItem("edges") || "[]");

      return {
        nodes,
        edges,
      };
    } catch (error) {
      console.error("GET STORAGE ERROR:", error);

      return {
        nodes: [],
        edges: [],
      };
    }
  }, []);

  // SET
  const setNodesEdges = useCallback((nodes = [], edges = []) => {
    try {
      localStorage.setItem("nodes", JSON.stringify(nodes));

      localStorage.setItem("edges", JSON.stringify(edges));
    } catch (error) {
      console.error("SET STORAGE ERROR:", error);
    }
  }, []);

  // CLEAR
  const clearNodesEdges = useCallback(() => {
    try {
      localStorage.removeItem("nodes");

      localStorage.removeItem("edges");
    } catch (error) {
      console.error("CLEAR STORAGE ERROR:", error);
    }
  }, []);

  return {
    getNodesEdges,
    setNodesEdges,
    clearNodesEdges,
  };
};
