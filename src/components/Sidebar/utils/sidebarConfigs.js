import FormFields from "../FormFields";
import AddButton from "../AddButton";
import Card from "../Carousel/Card";

export const SIDEBAR_CONFIGS = {
  carousel: [
    {
      component: Card,
      componentPropsBuilder: ({ nodeData, handlers }) => ({
        nodeData,
        removeCard: handlers.carousel.removeCard,
        reorderCards: handlers.carousel.reorderCards,
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
  form: [
    {
      component: FormFields,
      componentPropsBuilder: ({ nodeData, handlers }) => ({
        nodeData,
        formHandlers: handlers.form,
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
};
