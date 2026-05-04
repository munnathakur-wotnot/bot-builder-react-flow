import React from "react";
import PropTypes from "prop-types";

export default function SidebarContent({
  configs,
  nodeData,
  nodes,
  handlers,
  onNavigate,
  currentItemId,
  currentItemType,
}) {
  return (
    <>
      {configs?.map((config, index) => {
        const Component = config.component;
        const componentProps = config.componentPropsBuilder
          ? config.componentPropsBuilder({
              nodeData,
              nodes,
              handlers,
              onNavigate,
              currentItemId,
              currentItemType,
            })
          : {};

        return (
          <React.Fragment key={`${Component?.name ?? "sidebar-item"}-${index}`}>
            {Component ? <Component {...componentProps} /> : null}
          </React.Fragment>
        );
      })}
    </>
  );
}

SidebarContent.propTypes = {
  configs: PropTypes.arrayOf(
    PropTypes.shape({
      component: PropTypes.elementType,
      componentPropsBuilder: PropTypes.func,
    }),
  ).isRequired,
  nodeData: PropTypes.object,
  nodes: PropTypes.array,
  handlers: PropTypes.object.isRequired,
  onNavigate: PropTypes.func,
  currentItemId: PropTypes.string,
  currentItemType: PropTypes.string,
};
