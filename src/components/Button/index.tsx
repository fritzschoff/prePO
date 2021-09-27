import "./styles.scss";
import classNames from "classnames";

interface ButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export default function Button({
  text,
  className,
  onClick,
  disabled,
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={classNames("button-animation", className)}
    >
      {text}
    </button>
  );
}
