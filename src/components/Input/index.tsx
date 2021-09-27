import { ChangeEvent, HTMLInputTypeAttribute, KeyboardEvent } from "react";
import "./styles.scss";

interface InputProps {
  type: HTMLInputTypeAttribute;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

export default function Input({ type, onChange, value }: InputProps) {
  return (
    <div className="input-container">
      <input onChange={onChange} type={type} value={value} className="input" />
      <span>Use a period for indicating a decimal</span>
    </div>
  );
}
