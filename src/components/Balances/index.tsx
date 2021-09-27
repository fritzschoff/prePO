import { utils, BigNumber } from "ethers";
import "./styles.scss";

interface BalancesProps {
  daiBalance: BigNumber;
  ethBalance: BigNumber;
}

export default function Balances({ daiBalance, ethBalance }: BalancesProps) {
  return (
    <div className="balances-container">
      <div className="balance">
        <span>Your DAI balance:&nbsp;</span>
        {/* Could use formatEther as well but the syntax would be confusing */}
        <span className="highlight">{utils.formatUnits(daiBalance, 18)}</span>
      </div>
      <div className="balance">
        <span>Your ETH balance:&nbsp;</span>
        <span className="highlight">{utils.formatEther(ethBalance)}</span>
      </div>
    </div>
  );
}
