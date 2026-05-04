import AiQuestionField from "../categories/ai/AiQuestionField";
import AiPromptField from "../categories/ai/AiPromptField";
import AiKbDropdown from "../categories/ai/AiKbDropdown";
import AiFnDropdown from "../categories/ai/AiFnDropdown";
import FunctionLayer from "../categories/ai/FunctionLayer";
import KbLayer from "../categories/ai/KbLayer";

export const AI_CONFIGS = {
  ai_answer: {
    layers: [
      // layer 0 – root fields
      [
        {
          component: AiQuestionField,
          componentPropsBuilder: ({ nodeData, handlers }) => ({
            value: nodeData?.question ?? "",
            onChange: (e) => handlers.ai.setQuestion(e.target.value),
          }),
        },
        {
          component: AiKbDropdown,
          componentPropsBuilder: ({ nodeData, handlers, onNavigate }) => ({
            nodeData,
            handlers,
            onNavigate,
          }),
        },
        {
          component: AiPromptField,
          componentPropsBuilder: ({ nodeData, handlers }) => ({
            value: nodeData?.prompt ?? "",
            onChange: (e) => handlers.ai.setPrompt(e.target.value),
          }),
        },
        {
          component: AiFnDropdown,
          componentPropsBuilder: ({ nodeData, handlers, onNavigate }) => ({
            nodeData,
            handlers,
            onNavigate,
          }),
        },
      ],
      // layer 1 – KB or Function detail (discriminated by currentItemType)
      [
        {
          component: KbLayer,
          // only render for KB items
          shouldRender: ({ currentItemType }) => currentItemType === "kb",
          componentPropsBuilder: ({ nodeData, currentItemId, handlers }) => {
            const kb =
              nodeData?.knowledgeBases?.find((k) => k.id === currentItemId) ??
              {};
            return { kb, handlers };
          },
        },
        {
          component: FunctionLayer,
          // only render for function items
          shouldRender: ({ currentItemType }) => currentItemType === "fn",
          componentPropsBuilder: ({ nodeData, currentItemId, handlers }) => {
            const fn =
              nodeData?.availableFunctions?.find(
                (f) => f.id === currentItemId,
              ) ?? {};
            return { fn, handlers };
          },
        },
      ],
    ],
  },
};
