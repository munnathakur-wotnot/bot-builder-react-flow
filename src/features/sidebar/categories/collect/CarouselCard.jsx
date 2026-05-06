import React, { useCallback } from "react";
import PropTypes from "prop-types";
import AppInput from "../../../../shared/ui/atoms/AppInput";

export default function CarouselCard({ card, onTitleChange }) {
  const handleChange = useCallback(
    (e) => onTitleChange(card.id, e.target.value),
    [card?.id, onTitleChange],
  );

  if (!card) return null;

  const hasError = !card.title?.trim();

  return (
    <div className="node-sidebar__second-layer-content">
      <p className="node-sidebar__section-title">Card Settings</p>
      <label className="node-sidebar__label">
        Title
        <AppInput
          className={`node-sidebar__input${hasError ? " node-sidebar__input--error" : ""}`}
          value={card.title ?? ""}
          onChange={handleChange}
          placeholder="Card title"
        />
        {hasError && (
          <span className="node-sidebar__field-error">
            Card title is required
          </span>
        )}
      </label>
    </div>
  );
}

CarouselCard.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
  }),
  onTitleChange: PropTypes.func.isRequired,
};
