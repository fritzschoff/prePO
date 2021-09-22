import Web3Connect from "../Web3Connect";
import "./styles.scss";

export default function Header() {
  return (
    <header className="header">
      <h1>
        Swap a tokens on <span className="pink">Uniswap V2</span>
      </h1>
      <Web3Connect />
    </header>
  );
}
