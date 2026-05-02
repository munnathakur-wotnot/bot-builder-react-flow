import React, { forwardRef, memo } from "react";
import PropTypes from "prop-types";

const AppInput = forwardRef(function AppInput(
  { type, className, value, onChange, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={className}
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
});

AppInput.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
};

AppInput.defaultProps = {
  type: "text",
  className: undefined,
  value: undefined,
  onChange: undefined,
};

export default memo(AppInput);
