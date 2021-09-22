import Input from "../../components/Input";
import Balances from "../../components/Balances";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { useERC20 } from "../../hooks/ERC20";
import { BigNumber, constants, utils } from "ethers";
import "./styles.scss";
import {
  SwapTransaction,
  UniswapReserves,
} from "../../interfaces/swap.interface";
import BalanceList from "../../components/Balances/BalanceList";
import Button from "../../components/Button";

export default function Swap() {
  const { active, library, account } = useWeb3React();
  const [sufficientAllowance, setSufficientAllowance] = useState(false);
  const [pendingApproveTx, setPendingApproveTx] = useState(false);
  const { balanceOf, getReserves, swap, allowance, approve, parseUserInput } =
    useERC20(library);
  const [uniswapReserves, setUniswapReserves] = useState<UniswapReserves>({
    price: "0",
    balanceToken0: constants.Zero,
    balanceToken1: constants.Zero,
    lastUpdated: 0,
  });
  const [txObject, setTxObject] = useState<SwapTransaction>({
    daiBalance: constants.Zero,
    ethBalance: constants.Zero,
    amountToSend: "0",
  });

  useEffect(() => {
    if (active && account) {
      fetchBalance();
      checkAllowance();
      fetchLatestPrice();
      setInterval(() => {
        fetchLatestPrice();
      }, 15000);
    }
  }, [active, account]);

  if (!active && !account) return <h3>Please connect your wallet</h3>;

  const fetchBalance = async () => {
    const ethBalance: BigNumber = await library.getBalance(account);
    // If balance is 0, empty object can be returned
    let daiBalance = await balanceOf(account!);
    if (!(daiBalance instanceof BigNumber)) {
      daiBalance = BigNumber.from("0");
    }
    setTxObject((state) => ({ ...state, daiBalance, ethBalance }));
  };

  const fetchLatestPrice = async () => {
    const [DAI, ETH, blockTimeStamp] = await getReserves();
    const priceOfEth = DAI.div(ETH);
    // If equal, no reason to update
    if (blockTimeStamp !== uniswapReserves.lastUpdated) {
      setUniswapReserves({
        price: priceOfEth.toString(),
        balanceToken0: DAI,
        balanceToken1: ETH,
        lastUpdated: blockTimeStamp,
      });
    }
  };

  const approveUniswapRouter = async (max: boolean) => {
    if (txObject.amountToSend) {
      let tx;
      try {
        setPendingApproveTx(true);
        if (max) {
          tx = await approve(constants.MaxUint256);
        } else {
          tx = await approve(parseUserInput(txObject.amountToSend));
        }
        tx.wait(1).then(() => setPendingApproveTx(false));
      } catch (error) {
        setPendingApproveTx(false);
        console.error(error);
      }
    }
  };

  const sendTx = async () => {
    /*     console.log(
      parseUserInput(
        uniswapReserves.balanceToken1
          .div(parseUserInput(txObject.amountToSend!))
          .toString()
      ).toString()
    ); */
    if (txObject.amountToSend && account) {
      const result = await swap(
        "0000690681",
        txObject.amountToSend,
        account,
        Date.now() + 1000 * 60 * 5 //  5 mins
      );
      console.log(result);
    }
  };

  const checkAllowance = async () => {
    const amount = await allowance(account!);
    const amountInDAI = parseUserInput(txObject.amountToSend || "0");
    setSufficientAllowance(amount.gte(amountInDAI));
  };

  return (
    <div className="swap-container">
      <h3>
        Swap your <span className="highlight">DAI</span> to&nbsp;
        <span className="highlight">ETH </span>
      </h3>
      <Balances
        daiBalance={txObject.daiBalance}
        ethBalance={txObject.ethBalance}
      />
      <Input
        type="text"
        value={txObject.amountToSend}
        focused={checkAllowance}
        onBlur={checkAllowance}
        onChange={(event) => {
          if (event) {
            setTxObject((state) => ({
              ...state,
              amountToSend: event.target.value.replaceAll(",", ""),
            }));
          }
        }}
      />
      <BalanceList
        balanceToken0={
          utils
            .formatUnits(uniswapReserves.balanceToken0, 18)
            .toString()
            .split(".")[0]
        }
        balanceToken1={
          utils
            .formatEther(uniswapReserves.balanceToken1)
            .toString()
            .split(".")[0]
        }
        price={uniswapReserves.price}
      />
      <em>Assumed slippage is 0.5%</em>
      <em>
        Data last updated at:&nbsp;
        {new Date(uniswapReserves.lastUpdated * 1000).toUTCString()}
      </em>
      {sufficientAllowance && !pendingApproveTx && (
        <Button text="Send Transaction" onClick={sendTx} className="web3-btn" />
      )}
      {!pendingApproveTx && !sufficientAllowance && (
        <>
          <Button
            text="Approve infinite DAI"
            onClick={() => approveUniswapRouter(true)}
            className="web3-btn"
          />
          <Button
            text="Approve exact DAI"
            onClick={() => approveUniswapRouter(false)}
            className="web3-btn"
          />
        </>
      )}
      {pendingApproveTx && !sufficientAllowance && (
        <span>
          Waiting for miners to pick up the transaction
          <span className="highlight">...</span>
        </span>
      )}
    </div>
  );
}
