import { ChangeEvent, HTMLInputTypeAttribute, KeyboardEvent } from "react";
import "./styles.scss";

interface InputProps {
  type: HTMLInputTypeAttribute;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  onBlur?: () => void;
  focused?: () => void;
}

export default function Input({
  type,
  onChange,
  value,
  onBlur,
  focused,
}: InputProps) {
  return (
    <div className="input-container">
      <input
        onChange={onChange}
        onFocus={focused}
        type={type}
        value={value}
        className="input"
        onBlur={onBlur}
      />
      <span>Use a period . for indicating a decimal</span>
    </div>
  );
}
