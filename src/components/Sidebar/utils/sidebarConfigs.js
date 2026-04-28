import FormFields from "../FormFields";
import AddButton from "../AddButton";

export const SIDEBAR_CONFIGS = {
  carousel: [
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
