import FormFields from "../categories/collect/FormFields";
import AddButton from "../categories/collect/AddButton";
import Card from "../categories/collect/Card";
import CardSecondLayer from "../categories/collect/CardSecondLayer";
import FieldSecondLayer from "../categories/collect/FieldSecondLayer";

export const COLLECT_CONFIGS = {
  carousel: {
    layers: [
      // layer 0 â€” card list
      [
        {
          component: Card,
          componentPropsBuilder: ({ nodeData, handlers, onNavigate }) => ({
            nodeData,
            removeCard: handlers.carousel.removeCard,
            reorderCards: handlers.carousel.reorderCards,
            onNavigate,
          }),
        },
        {
          component: AddButton,
          componentPropsBuilder: ({ handlers }) => ({
            handleAddButton: handlers.carousel.addCarouselCard,
            text: "Add Card",
          }),
        },
      ],
      // layer 1 – card detail
      [
        {
          component: CardSecondLayer,
          componentPropsBuilder: ({ nodes, currentItemId, handlers }) => {
            const cardNode = nodes?.find((n) => n.id === currentItemId);
            const card = cardNode
              ? { id: cardNode.id, ...cardNode.data }
              : null;
            return {
              card,
              onTitleChange: handlers.carousel.updateCardTitle,
              onButtonTitleChange: handlers.carousel.updateButtonTitle,
            };
          },
        },
      ],
    ],
  },
  form: {
    layers: [
      // layer 0 â€” field list
      [
        {
          component: FormFields,
          componentPropsBuilder: ({ nodeData, handlers, onNavigate }) => ({
            nodeData,
            formHandlers: handlers.form,
            onNavigate,
          }),
        },
        {
          component: AddButton,
          componentPropsBuilder: ({ handlers }) => ({
            handleAddButton: handlers.form.addFormField,
            text: "Add Field",
          }),
        },
      ],
      // layer 1 – field detail
      [
        {
          component: FieldSecondLayer,
          componentPropsBuilder: ({ nodeData, currentItemId, handlers }) => {
            const field =
              nodeData?.fields?.find((f) => f.id === currentItemId) ?? null;
            return {
              field,
              onLabelChange: handlers.form.updateFieldLabel,
              onTypeChange: handlers.form.updateFieldType,
            };
          },
        },
      ],
    ],
  },
};
