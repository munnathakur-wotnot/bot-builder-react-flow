import React, { useCallback } from "react";
import PropTypes from "prop-types";
import AppInput from "../../../../shared/ui/atoms/AppInput";

// Each input is its own component so only it re-renders on change.
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
      {hasError && <span className="node-sidebar__field-error">Button title is required</span>}
    </label>
  );
}

ButtonRow.propTypes = {
  button: PropTypes.shape({ id: PropTypes.string.isRequired, title: PropTypes.string }).isRequired,
  cardId: PropTypes.string.isRequired,
  onButtonTitleChange: PropTypes.func.isRequired,
};

export default function CardSecondLayer({ card, onTitleChange, onButtonTitleChange }) {
  const handleTitleChange = useCallback(
    (e) => onTitleChange(card.id, e.target.value),
    [card?.id, onTitleChange],
  );

  if (!card) return null;

  const buttons = card.buttons ?? [];

  const titleHasError = !card.title?.trim();

  return (
    <div className="node-sidebar__second-layer-content">
      <p className="node-sidebar__section-title">Card Settings</p>
      <label className="node-sidebar__label">
        Title
        <AppInput
          className={`node-sidebar__input${titleHasError ? " node-sidebar__input--error" : ""}`}
          value={card.title ?? ""}
          onChange={handleTitleChange}
          placeholder="Card title"
        />
        {titleHasError && <span className="node-sidebar__field-error">Card title is required</span>}
      </label>

      {buttons.length > 0 && (
        <>
          <p className="node-sidebar__section-title" style={{ marginTop: 16 }}>
            Buttons
          </p>
          {buttons.map((btn) => (
            <ButtonRow
              key={btn.id}
              button={btn}
              cardId={card.id}
              onButtonTitleChange={onButtonTitleChange}
            />
          ))}
        </>
      )}
    </div>
  );
}

CardSecondLayer.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    buttons: PropTypes.arrayOf(
      PropTypes.shape({ id: PropTypes.string.isRequired, title: PropTypes.string }),
    ),
  }),
  onTitleChange: PropTypes.func.isRequired,
  onButtonTitleChange: PropTypes.func.isRequired,
};

