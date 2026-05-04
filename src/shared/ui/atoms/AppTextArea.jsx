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
}) {
    const handleChange = (e) => {
        console.log(e, onChange, "Hello onchange");

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
                className={`app-textarea ${className}`}
                value={value}
                style={{ minHeight: "100px" }}
                onChange={handleChange}
                placeholder={placeholder}
            />
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
};

AppTextarea.defaultProps = {
    value: "",
    label: "",
    placeholder: "",
};
