import AiMenu from "./AiContextCard";
import ContextMenu from "./ContextMenu";

export const menuRendering = (menu, props) => {
  return menu.type === "success" && !menu.addAnother
    ? { compoent: AiMenu, props: { ...props } }
    : { compoent: ContextMenu, props: { ...props } };
};
