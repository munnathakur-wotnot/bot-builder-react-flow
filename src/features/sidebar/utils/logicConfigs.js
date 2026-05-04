import AddButton from "../categories/collect/AddButton";
import Branches from "../categories/logic/Branches";

export const LOGIC_CONFIG = {
  conditionRoot: {
    layers: [
      [
        {
          component: Branches,
          componentPropsBuilder: ({ nodeData, onNavigate }) => ({
            nodeData,
            // removeCard: handlers.carousel.removeCard,
            // reorderCards: handlers.carousel.reorderCards,
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
    ],
  },
};
