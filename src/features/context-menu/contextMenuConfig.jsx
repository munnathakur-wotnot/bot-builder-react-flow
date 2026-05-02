import { Icons } from "../../shared/ui/atoms/icons";

export { Icons };

export const MENU_CATEGORIES = [
  {
    id: "collect",
    label: "Collect",
    tabIcon: Icons.collect,
    color: "#2563eb",
    options: [
      { id: "collectInput", label: "Collect Input", icon: Icons.collectInput, color: "#2563eb" },
      { id: "carousel",     label: "Carousel",      icon: Icons.carousel,     color: "#7c3aed" },
      { id: "form",         label: "Form",          icon: Icons.form,         color: "#0891b2" },
    ],
  },
  {
    id: "ai",
    label: "AI",
    tabIcon: Icons.ai,
    color: "#9333ea",
    options: [
      { id: "answer_ai", label: "AI Answer", icon: Icons.aiAnswer, color: "#9333ea" },
    ],
  },
  {
    id: "logic",
    label: "Logic",
    tabIcon: Icons.logic,
    color: "#0ea5e9",
    options: [
      { id: "delay", label: "Delay", icon: Icons.delay, color: "#0ea5e9" },
    ],
  },
];