export function getLogicHandlers({ updateNode }) {
  return {
    delay: {
      setDuration: (value) => updateNode({ delayDuration: value }),
    },
  };
}
