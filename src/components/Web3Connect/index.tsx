import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import Button from "../Button";
import "./styles.scss";

export default function Web3Connect() {
  const { activate, active, error, deactivate } = useWeb3React();

  const connectToWeb3 = () => {
    if (!active) {
      activate(new InjectedConnector({ supportedChainIds: [1, 1337] }));
    } else {
      deactivate();
    }
  };

  return (
    <div className="web3-wrapper">
      {error && (
        <span className="error">
          {error.message.slice(0, 40).concat("...")}
        </span>
      )}
      <Button
        onClick={connectToWeb3}
        className="web3-btn"
        text={active ? "Disconnect" : "Connect Wallet"}
      />
    </div>
  );
}
