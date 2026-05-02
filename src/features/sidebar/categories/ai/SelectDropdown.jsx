import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { ChevronIcon, CheckIcon, InfoIcon } from "../../../../shared/ui/atoms/icons";

export default function SelectDropdown({
  label, options, value, multiSelect, placeholder,
  onSelect, onCreate, createLabel, onEdit, error, showInfo,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedValues = multiSelect ? (value ?? []) : value ? [value] : [];
  const isSelected = (id) => selectedValues.includes(id);
  const triggerText = multiSelect
    ? selectedValues.length === 0
      ? placeholder
      : `${selectedValues.length} function${selectedValues.length > 1 ? "s" : ""} selected`
    : (options.find((o) => o.id === value)?.name ?? placeholder);
  const hasValue = multiSelect ? selectedValues.length > 0 : Boolean(value);

  const handleItemClick = (id) => {
    if (multiSelect) {
      onSelect(isSelected(id) ? selectedValues.filter((v) => v !== id) : [...selectedValues, id]);
    } else {
      onSelect(id);
      setOpen(false);
    }
  };

  return (
    <div className="ai-field" ref={wrapRef}>
      <div className="ai-field__label-row">
        <span className="ai-field__label">{label}</span>
        {showInfo && <span className="ai-field__info-icon"><InfoIcon /></span>}
      </div>

      <button
        type="button"
        className={`ai-select__trigger${error ? " ai-select__trigger--error" : ""}${open ? " ai-select__trigger--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={hasValue ? "ai-select__value" : "ai-select__placeholder"}>{triggerText}</span>
        <span className={`ai-select__chevron${open ? " ai-select__chevron--up" : ""}`}><ChevronIcon /></span>
      </button>

      {error && <p className="ai-field__error">{error}</p>}

      {open && (
        <div className="ai-select__dropdown" role="listbox">
          {options.length === 0
            ? <div className="ai-select__empty">No options yet</div>
            : options.map((opt) => (
              <div
                key={opt.id}
                className={`ai-select__option-row${isSelected(opt.id) ? " ai-select__option-row--selected" : ""}`}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected(opt.id)}
                  className="ai-select__option"
                  onClick={() => handleItemClick(opt.id)}
                >
                  <span className="ai-select__check">{isSelected(opt.id) && <CheckIcon />}</span>
                  <span className="ai-select__opt-name">{opt.name}</span>
                </button>
                {onEdit && (
                  <button
                    type="button"
                    className="ai-select__edit-btn"
                    title="Edit"
                    onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(opt); }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                )}
              </div>
            ))
          }
          {onCreate && (
            <>
              <div className="ai-select__divider" />
              <button
                type="button"
                className="ai-select__create"
                onClick={() => { onCreate(); setOpen(false); }}
              >
                <span className="ai-select__create-plus">+</span>
                {createLabel}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

SelectDropdown.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  multiSelect: PropTypes.bool,
  placeholder: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
  onEdit: PropTypes.func,
  createLabel: PropTypes.string,
  error: PropTypes.string,
  showInfo: PropTypes.bool,
};
SelectDropdown.defaultProps = {
  multiSelect: false,
  placeholder: "Select\u2026",
  createLabel: "Create",
  error: null,
  showInfo: false,
};