import "./styles.scss";
import classNames from "classnames";

interface ButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
}

export default function Button({ text, className, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={classNames("button-animation", className)}
    >
      {text}
    </button>
  );
}
