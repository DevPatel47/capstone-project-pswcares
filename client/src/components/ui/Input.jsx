import { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      error,
      id,
      textarea = false,
      className = "",
      ...props
    },
    ref,
  ) => {
    const inputClass = `${error ? "app-input-error" : "app-input"} ${textarea ? "resize-none" : ""} ${className}`;

    return (
      <div>
        {label ? (
          <label htmlFor={id} className="app-label">
            {label}
          </label>
        ) : null}
        {textarea ? (
          <textarea ref={ref} id={id} className={inputClass} {...props} />
        ) : (
          <input ref={ref} id={id} className={inputClass} {...props} />
        )}
        {error ? <p className="app-error">{error}</p> : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
