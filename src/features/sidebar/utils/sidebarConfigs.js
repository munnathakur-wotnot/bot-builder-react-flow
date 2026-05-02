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
      // layer 1 â€” card detail
      [
        {
          component: CardSecondLayer,
          componentPropsBuilder: ({ handlers, layerContext }) => ({
            card: layerContext,
            onTitleChange: handlers.carousel.updateCardTitle,
            onButtonTitleChange: handlers.carousel.updateButtonTitle,
          }),
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
      // layer 1 â€” field detail
      [
        {
          component: FieldSecondLayer,
          componentPropsBuilder: ({ handlers, layerContext }) => ({
            field: layerContext,
            onLabelChange: handlers.form.updateFieldLabel,
            onTypeChange: handlers.form.updateFieldType,
          }),
        },
      ],
    ],
  },
};
