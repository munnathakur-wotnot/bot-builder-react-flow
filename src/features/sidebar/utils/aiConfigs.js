import AiQuestionField from "../categories/ai/AiQuestionField";
import AiPromptField   from "../categories/ai/AiPromptField";
import AiKbDropdown    from "../categories/ai/AiKbDropdown";
import AiFnDropdown    from "../categories/ai/AiFnDropdown";
import FunctionLayer   from "../categories/ai/FunctionLayer";
import KbLayer         from "../categories/ai/KbLayer";

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
      // layer 1 – KB or Function detail (discriminated by layerContext._type)
      [
        {
          component: KbLayer,
          // only render for KB items
          shouldRender: ({ layerContext }) => layerContext?._type === "kb",
          componentPropsBuilder: ({ layerContext, handlers }) => ({
            layerContext,
            handlers,
          }),
        },
        {
          component: FunctionLayer,
          // only render for function items
          shouldRender: ({ layerContext }) => layerContext?._type === "fn",
          componentPropsBuilder: ({ layerContext, handlers }) => ({
            layerContext,
            handlers,
          }),
        },
      ],
    ],
  },
};