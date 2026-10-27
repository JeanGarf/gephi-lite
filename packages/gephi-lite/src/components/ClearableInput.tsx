import { FC } from "react";

import { CloseIcon } from "./common-icons";

/** Cross button laid over the right end of a field (in a `position-relative` wrapper), to empty it. */
export const ClearButton: FC<{ title: string; onClick: () => void }> = ({ title, onClick }) => (
  <button
    type="button"
    className="gl-btn gl-btn-icon position-absolute top-50 end-0 translate-middle-y"
    title={title}
    aria-label={title}
    onClick={onClick}
  >
    <CloseIcon />
  </button>
);

/** Text input with a cross button to empty it. */
export const ClearableInput: FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearTitle: string;
  className?: string;
}> = ({ value, onChange, placeholder, clearTitle, className }) => {
  return (
    <div className={`position-relative ${className ?? ""}`}>
      <input
        type="text"
        className="form-control form-control-sm pe-5"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder ?? clearTitle}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.stopPropagation();
            onChange("");
          }
        }}
      />
      {value && <ClearButton title={clearTitle} onClick={() => onChange("")} />}
    </div>
  );
};
