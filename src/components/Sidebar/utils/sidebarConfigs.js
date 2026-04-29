import FormFields from "../FormFields";
import AddButton from "../AddButton";
import Card from "../Carousel/Card";
import CardSecondLayer from "../Carousel/CardSecondLayer";
import FieldSecondLayer from "../Form/FieldSecondLayer";

export const SIDEBAR_CONFIGS = {
  carousel: {
    layers: [
      // layer 0 — card list
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
      // layer 1 — card detail
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
      // layer 0 — field list
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
      // layer 1 — field detail
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
