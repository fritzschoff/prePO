import { BigNumber, providers, Contract, utils, constants } from "ethers";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { useState } from "react";
import {
  erc20Interface,
  uniswapRouterV2Interface,
  uniswapV2PairInterface,
} from "../interfaces/contract.interface";
import {
  DAI_MAINNET,
  ETH_DAI_POOL,
  UNISWAP_ROUTER_V2,
  WETH,
} from "../utils/addresses";

const tradeRoute = [DAI_MAINNET, WETH];

export function useERC20(provider: providers.Web3Provider) {
  const [hasEnoughAllowance, setHasEnoughAllowance] = useState(false);
  const erc20Contract = new Contract(DAI_MAINNET, erc20Interface);
  const ETHDAIPool = new Contract(ETH_DAI_POOL, uniswapV2PairInterface);

  const balanceOf = (userAddress: string): Promise<BigNumber> => {
    return erc20Contract.connect(provider).balanceOf(userAddress);
  };

  const parseUserInput = (userInput: string) => {
    const indexOfPeriod = userInput.indexOf(".");
    const hasPeriod = indexOfPeriod >= 0;
    const parsedInput = hasPeriod ? userInput.replace(".", "") : userInput;
    if (hasPeriod) {
      return utils.parseUnits(
        parsedInput || "0",
        18 - userInput.slice(indexOfPeriod + 1).length
      );
    }
    return utils.parseUnits(parsedInput || "0", 18);
  };

  const getReserves = (): Promise<[BigNumber, BigNumber, number]> => {
    return ETHDAIPool.connect(provider).getReserves();
  };

  const allowance = async (ownerAddress: string, userAmount: BigNumber) => {
    const amount: BigNumber = await erc20Contract
      .connect(provider)
      .allowance(ownerAddress, UNISWAP_ROUTER_V2);
    setHasEnoughAllowance(() => amount.gte(userAmount));
  };

  const approve = async (amount: BigNumber) => {
    const data = erc20Interface.encodeFunctionData("approve", [
      UNISWAP_ROUTER_V2,
      amount,
    ]);
    return provider.getSigner().sendTransaction({ to: DAI_MAINNET, data });
  };

  const swap = async (
    minETHOut: BigNumber,
    maxDAIIn: string,
    address: string,
    deadline: number
  ) => {
    const data = uniswapRouterV2Interface.encodeFunctionData(
      "swapTokensForExactETH",
      [
        // TODO @MF Calc is wrong
        minETHOut.sub(utils.parseEther("0.001")),
        parseUserInput(maxDAIIn),
        tradeRoute,
        address,
        deadline,
      ]
    );
    const tx: TransactionRequest = {
      to: UNISWAP_ROUTER_V2,
      data,
      chainId: 1,
    };
    return provider.getSigner().sendTransaction(tx);
  };

  // TODO @MF Remove when prod
  const swapETHforDAI = async (account: string) => {
    const data = uniswapRouterV2Interface.encodeFunctionData(
      "swapExactETHForTokens",
      [
        "1",
        ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", DAI_MAINNET],
        account,
        Date.now() + 1000 * 60 * 5,
      ]
    );
    const tx: TransactionRequest = {
      to: UNISWAP_ROUTER_V2,
      chainId: 1,
      data,
      value: utils.parseEther("1"),
    };
    return provider.getSigner().sendTransaction(tx);
  };

  return {
    balanceOf,
    getReserves,
    swap,
    approve,
    allowance,
    parseUserInput,
    swapETHforDAI,
    hasEnoughAllowance,
  };
}
