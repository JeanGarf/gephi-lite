import { FC } from "react";

import { normalizeText } from "../../core/search";
import { ClearButton } from "../ClearableInput";
import { Select, StringOption } from "./Select";

/**
 * Editable combobox: a text field that is also a dropdown of options. The text stays free (typing
 * narrows the options, and the caller decides what the raw text means), while picking an option
 * puts its label in the field and tells the caller which option it was.
 */
export const Combobox: FC<{
  text: string;
  onTextChange: (text: string) => void;
  options: StringOption[];
  onPick: (option: StringOption) => void;
  placeholder?: string;
  clearTitle: string;
}> = ({ text, onTextChange, options, onPick, placeholder, clearTitle }) => (
  // Escape reaches this wrapper only when the dropdown is closed (Select swallows it otherwise),
  // so it then empties the field, like in ClearableInput.
  <div
    className="position-relative"
    onKeyDown={(e) => {
      if (e.key === "Escape" && text) {
        e.stopPropagation();
        onTextChange("");
      }
    }}
  >
    <Select<StringOption>
      options={options}
      value={null}
      inputValue={text}
      placeholder={placeholder}
      aria-label={placeholder ?? clearTitle}
      // The field's text is owned by the caller: react-select must not blank it on blur or pick.
      onInputChange={(value, { action }) => {
        if (action === "input-change") onTextChange(value);
      }}
      onChange={(option) => option && onPick(option)}
      filterOption={(option, input) => normalizeText(String(option.label)).includes(normalizeText(input.trim()))}
      noOptionsMessage={() => null}
      components={{ DropdownIndicator: null }}
    />
    {text && <ClearButton title={clearTitle} onClick={() => onTextChange("")} />}
  </div>
);
