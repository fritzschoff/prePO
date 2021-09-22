interface BalanceList {
  price: string;
  balanceToken0: string;
  balanceToken1: string;
}

export default function BalanceList({
  price,
  balanceToken0,
  balanceToken1,
}: BalanceList) {
  return (
    <ul>
      <li>
        Current Price of <span className="highlight">ETH</span> in&nbsp;
        <span className="highlight">DAI</span> is:&nbsp;
        <span className="highlight">{price} $</span>
      </li>
      <li>
        <span className="highlight">DAI</span> in Pool:&nbsp;
        <span className="highlight">{balanceToken0}</span>
      </li>
      <li>
        <span className="highlight">ETH</span> in Pool:&nbsp;
        <span className="highlight">{balanceToken1}</span>
      </li>
    </ul>
  );
}
