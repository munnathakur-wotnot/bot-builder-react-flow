// shared/ui/atoms/AppTextarea.jsx
import React from "react";
import PropTypes from "prop-types";
import "./AppTextarea.css";

export default function AppTextarea({
    label,
    value,
    onChange,
    placeholder,
    className = "",
    id,
    error,
}) {
    const handleChange = (e) => {
        onChange(e);
    };

    return (
        <div className="app-textarea__wrapper">
            {label && (
                <label className="app-textarea__label" htmlFor={id}>
                    {label}
                </label>
            )}

            <textarea
                id={id}
                className={`app-textarea${error ? " app-textarea--error" : ""} ${className}`}
                value={value}
                style={{ minHeight: "100px" }}
                onChange={handleChange}
                placeholder={placeholder}
            />
            {error && <span className="app-textarea__error">{error}</span>}
        </div>
    );
}

AppTextarea.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string,
    error: PropTypes.string,
};

AppTextarea.defaultProps = {
    value: "",
    label: "",
    placeholder: "",
};
