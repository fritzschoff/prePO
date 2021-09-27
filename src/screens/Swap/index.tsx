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
import { findAllCommas, findAllLetters } from "../../utils/regex";

export default function Swap() {
  const { active, library, account } = useWeb3React();
  const [pendingApproveTx, setPendingApproveTx] = useState(false);
  const {
    balanceOf,
    getReserves,
    swap,
    allowance,
    approve,
    parseUserInput,
    swapETHforDAI,
    hasEnoughAllowance,
  } = useERC20(library);
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
  let intervalObserver: NodeJS.Timeout;

  useEffect(() => {
    if (active && account) {
      fetchBalance();
      checkAllowance();
      fetchLatestPrice();
      intervalObserver = setInterval(() => {
        fetchLatestPrice();
      }, 15000);
    }
    return () => clearInterval(intervalObserver);
  }, [active, account]);

  if (!active && !account) return <h3>Please connect your wallet</h3>;

  const fetchBalance = async () => {
    const ethBalance: BigNumber = await library.getBalance(account);
    let daiBalance = await balanceOf(account!);
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
        await tx.wait(1);
        checkAllowance();
        setPendingApproveTx(false);
      } catch (error) {
        setPendingApproveTx(false);
        console.error(error);
      }
    }
  };

  const sendTx = async () => {
    if (txObject.amountToSend && account) {
      const expectedReturn = uniswapReserves.balanceToken1
        .mul(parseUserInput(txObject.amountToSend))
        .div(
          uniswapReserves.balanceToken0.add(
            parseUserInput(txObject.amountToSend)
          )
        );
      const tx = await swap(
        expectedReturn,
        txObject.amountToSend,
        account,
        Date.now() + 1000 * 60 * 3 // 3 mins
      );
      tx.wait(1).then(() => {
        checkAllowance();
        fetchBalance();
      });
    }
  };

  const checkAllowance = async (userInput?: string) => {
    if (txObject.amountToSend) {
      await allowance(
        account!,
        parseUserInput(userInput ? userInput : txObject.amountToSend)
      );
    }
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
        onChange={(event) => {
          if (event) {
            setTxObject((state) => {
              const parsedInput = event.target.value
                .replace(findAllCommas, "")
                .replace(findAllLetters, "");
              checkAllowance(parsedInput);
              return {
                ...state,
                amountToSend: parsedInput,
              };
            });
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
      <em>
        Assumed slippage is 0.5%{" "}
        <img src="/assets/slip.png" className="slip-img" />
      </em>
      <em>
        Last trade happened on this&nbsp;
        <span className="highlight">pool</span> at:&nbsp;
        {new Date(uniswapReserves.lastUpdated * 1000).toUTCString()}
      </em>
      {/* TODO MF Remove when ready */}
      <Button text="Send Transaction" onClick={() => swapETHforDAI(account!)} />
      {hasEnoughAllowance && !pendingApproveTx ? (
        <Button text="Send Transaction" onClick={sendTx} className="web3-btn" />
      ) : (
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
      {pendingApproveTx && hasEnoughAllowance && (
        <span>
          Waiting for miners to pick up the transaction
          <span className="highlight">...</span>
        </span>
      )}
    </div>
  );
}
