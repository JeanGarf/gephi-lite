import { ComponentProps, FC, useRef } from "react";
import { type SelectInstance, components } from "react-select";

import { normalizeText } from "../../core/search";
import { ClearButton } from "../ClearableInput";
import { CaretDownIcon } from "../common-icons";
import { Select, StringOption } from "./Select";

// react-select hides the typed text after a pick (it expects the picked value to take its place),
// but here the text is the field's content: keep it shown. Defined here, not inline, so that it is
// not a new component (hence a remount losing the focus) on every render.
const COMBOBOX_COMPONENTS = {
  DropdownIndicator: null,
  Input: (props: ComponentProps<typeof components.Input>) => <components.Input {...props} isHidden={false} />,
};

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
  toggleTitle: string;
}> = ({ text, onTextChange, options, onPick, placeholder, clearTitle, toggleTitle }) => {
  const selectRef = useRef<SelectInstance<StringOption>>(null);

  // Whether the list was open when the caret was pressed: on touch screens the press already moves
  // the focus away (which closes the list) before the click arrives, so the click cannot tell by
  // itself whether it is meant to open or to close.
  const wasOpenRef = useRef(false);

  // Opens (or closes) the dropdown from the caret button. The field is focused so that react-select
  // keeps its usual behaviour (closing on outside click, Escape...), but flagged `inputmode="none"`
  // meanwhile so that touch devices do not raise their on-screen keyboard over the list.
  const toggleMenu = () => {
    const select = selectRef.current;
    const input = select?.inputRef;
    if (!select || !input) return;
    if (wasOpenRef.current) return select.blur();
    input.setAttribute("inputmode", "none");
    select.openMenu("first");
    select.focus();
  };

  // Tapping the field after the caret gives the keyboard back. The flag is dropped, and the field
  // refocused since a focused field does not raise the keyboard just because its mode changed.
  const restoreKeyboard = (input: HTMLInputElement) => {
    if (!input.hasAttribute("inputmode")) return;
    input.removeAttribute("inputmode");
    input.blur();
    input.focus();
  };

  return (
    // Escape reaches this wrapper only when the dropdown is closed (Select swallows it otherwise),
    // so it then empties the field, like in ClearableInput.
    <div
      className="position-relative"
      onPointerDown={(e) => {
        if (e.target instanceof HTMLInputElement) restoreKeyboard(e.target);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && text) {
          e.stopPropagation();
          onTextChange("");
        }
      }}
    >
      <Select<StringOption>
        ref={selectRef}
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
        onBlur={(e) => e.target.removeAttribute("inputmode")}
        components={COMBOBOX_COMPONENTS}
        styles={{ valueContainer: (base) => ({ ...base, paddingRight: "3.5rem" }) }}
      />
      {text && <ClearButton title={clearTitle} className="me-4" onClick={() => onTextChange("")} />}
      <button
        type="button"
        className="gl-btn gl-btn-icon position-absolute top-50 end-0 translate-middle-y"
        title={toggleTitle}
        aria-label={toggleTitle}
        // Keeps the focus where it is, so that a click on an open list's caret closes it (via blur).
        onMouseDown={(e) => e.preventDefault()}
        onPointerDown={() => {
          wasOpenRef.current = !!selectRef.current?.props.menuIsOpen;
        }}
        onClick={toggleMenu}
      >
        <CaretDownIcon />
      </button>
    </div>
  );
};
