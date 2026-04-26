import React from "react";
import PropTypes from "prop-types";
import "./ContextMenu.css";

const MENU_OPTIONS = [
  { id: "collectInput", label: "Collect Input" },
  { id: "carousel", label: "Carousel" },
  { id: "form", label: "Form" },
];

export default function ContextMenu({ position, onSelect, onClose }) {
  if (!position) return null;

  // function onSelectManyTime(id) {
  //   for (let i = 0; i < 50; i++) {
  //     onSelect(id);
  //   }
  // }

  return (
    <div
      className="context-menu"
      style={{ top: position.y, left: position.x }}
      role="menu"
    >
      <div className="context-menu__header">
        <input className="context-menu__search" placeholder="Search..." />
      </div>

      <div className="context-menu__options">
        {MENU_OPTIONS.map((option) => (
          <button
            key={option.id}
            className="context-menu__option"
            type="button"
            onClick={() => onSelect(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button className="context-menu__close" type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

ContextMenu.propTypes = {
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ContextMenu.defaultProps = {
  position: null,
};
