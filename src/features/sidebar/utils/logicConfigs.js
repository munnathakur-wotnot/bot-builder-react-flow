import AddButton from "../categories/collect/AddButton";
import Branches from "../categories/logic/Branches";
import ConditionEditor from "../categories/logic/ConditionEditor";

export const LOGIC_CONFIG = {
  conditionRoot: {
    layers: [
      // layer 0 – branch list
      [
        {
          component: Branches,
          componentPropsBuilder: ({ nodeData, handlers, onNavigate }) => ({
            nodeData,
            removeCard: handlers.conditionRoot.removeBranch,
            reorderCards: handlers.conditionRoot.reorderBranches,
            onNavigate,
          }),
        },
        {
          component: AddButton,
          componentPropsBuilder: ({ handlers }) => ({
            handleAddButton: handlers.conditionRoot.addConditionCard,
            text: "Add Branch",
          }),
        },
      ],
      // layer 1 – branch condition editor
      [
        {
          component: ConditionEditor,
          componentPropsBuilder: ({ nodes, currentItemId, handlers }) => {
            const branchNode = nodes?.find((n) => n.id === currentItemId);
            return {
              branchNode: branchNode?.data ?? null,
              onUpdateConditions: handlers.conditionRoot.updateBranchConditions,
              onUpdateConditionType: handlers.conditionRoot.updateBranchConditionType,
            };
          },
        },
      ],
    ],
  },
};
