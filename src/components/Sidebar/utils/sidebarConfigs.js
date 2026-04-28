import FormFields from "../FormFields";
import AddButton from "../AddButton";

export const SIDEBAR_CONFIGS = {
  carousel: [
    {
      component: AddButton,
      componentPropsBuilder: ({ handlers }) => ({
        handleAddButton: handlers.addCarouselCard,
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
        handleAddButton: handlers.addFormField,
        text: "Add Field",
      }),
    },
  ],
};
