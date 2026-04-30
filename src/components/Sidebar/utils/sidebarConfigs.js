import FormFields from "../FormFields";
import AddButton from "../AddButton";
import Card from "../Carousel/Card";
import CardDetailsLayer from "../Carousel/CardDetailsLayer";

export const SIDEBAR_CONFIGS = {
  carousel: {
    firstLayer: [
      {
        component: Card,
        componentPropsBuilder: ({ nodeData, handlers, setlayer }) => ({
          nodeData,
          removeCard: handlers.carousel.removeCard,
          reorderCards: handlers.carousel.reorderCards,
          onCardClick: handlers.carousel.openCardLayer,
          setlayer,
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
    secondLayer: [
      {
        component: CardDetailsLayer,
        componentPropsBuilder: ({ nodeData, handlers, setlayer, layer }) => ({
          nodeData,
          onBack: setlayer,
          card: layer.data,
          onUpdateCard: handlers.carousel.secondLayer.cardUpdater,
        }),
      },
    ],
  },
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
