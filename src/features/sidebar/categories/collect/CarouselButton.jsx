import React, { useCallback } from "react";
import PropTypes from "prop-types";
import AppInput from "../../../../shared/ui/atoms/AppInput";

function ButtonRow({ button, cardId, onButtonTitleChange }) {
  const handleChange = useCallback(
    (e) => onButtonTitleChange(cardId, button.id, e.target.value),
    [cardId, button.id, onButtonTitleChange],
  );
  const hasError = !button.title?.trim();
  return (
    <label className="node-sidebar__label">
      Button title
      <AppInput
        className={`node-sidebar__input${hasError ? " node-sidebar__input--error" : ""}`}
        value={button.title ?? ""}
        onChange={handleChange}
        placeholder="Button title"
      />
      {hasError && (
        <span className="node-sidebar__field-error">
          Button title is required
        </span>
      )}
    </label>
  );
}

ButtonRow.propTypes = {
  button: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
  }).isRequired,
  cardId: PropTypes.string.isRequired,
  onButtonTitleChange: PropTypes.func.isRequired,
};

export default function CarouselButton({ card, onButtonTitleChange }) {
  if (!card) return null;

  const buttons = card.buttons ?? [];
  if (buttons.length === 0) return null;

  return (
    <div className="node-sidebar__second-layer-content">
      <p className="node-sidebar__section-title">Buttons</p>
      {buttons.map((btn) => (
        <ButtonRow
          key={btn.id}
          button={btn}
          cardId={card.id}
          onButtonTitleChange={onButtonTitleChange}
        />
      ))}
    </div>
  );
}

CarouselButton.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    buttons: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
      }),
    ),
  }),
  onButtonTitleChange: PropTypes.func.isRequired,
};
