import React from "react";
import PropTypes from "prop-types";

export default function SidebarContent({ configs, nodeData, handlers }) {
  return (
    <>
      {configs?.map((config, index) => {
        const Component = config.component;
        const componentProps = config.componentPropsBuilder
          ? config.componentPropsBuilder({ nodeData, handlers })
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
  handlers: PropTypes.shape({
    addCarouselCard: PropTypes.func,
    addFormField: PropTypes.func,
    form: PropTypes.shape({
      updateFieldLabel: PropTypes.func,
      updateFieldType: PropTypes.func,
      removeField: PropTypes.func,
    }),
  }).isRequired,
};
