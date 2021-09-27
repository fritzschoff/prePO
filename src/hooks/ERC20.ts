import { BigNumber, providers, Contract, utils } from "ethers";
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
} from "../utils/addresses";
import {
  ChainId,
  Pair,
  Percent,
  Route,
  Token,
  TokenAmount,
  Trade,
  TradeType,
  WETH,
} from "@uniswap/sdk";
import { UniswapReserves } from "../interfaces/swap.interface";
import { findAllPeriods } from "../utils/regex";

export function useERC20(provider: providers.Web3Provider) {
  const [hasEnoughAllowance, setHasEnoughAllowance] = useState(false);
  const DAIContract = new Contract(DAI_MAINNET, erc20Interface);
  const ETHDAIPool = new Contract(ETH_DAI_POOL, uniswapV2PairInterface);
  const DAI = new Token(ChainId.MAINNET, DAI_MAINNET, 18);

  /**
   * @description queries the balance of the user on the DAI contract.
   * @param userAddress address of the user.
   * @returns BigNumberObject that can be converted into a string for the UI.
   */
  const balanceOf = (userAddress: string): Promise<BigNumber> => {
    return DAIContract.connect(provider).balanceOf(userAddress);
  };

  /**
   * @description helper function that interprets the user input if he specifies
   * a decimal.
   * @param userInput input string that needs to be parsed.
   * @returns a BigNumber object with the correct length.
   */
  const parseUserInput = (userInput: string) => {
    const indexOfPeriod = userInput.indexOf(".");
    const hasPeriod = indexOfPeriod >= 0;
    const parsedInput = hasPeriod
      ? userInput.replace(findAllPeriods, "")
      : userInput;
    if (hasPeriod) {
      return utils.parseUnits(
        parsedInput || "0",
        18 - userInput.slice(indexOfPeriod + 1).length
      );
    }
    return utils.parseUnits(parsedInput || "0", 18);
  };

  /**
   * @returns the amount of tokens in the ETH-DAI pool on uniswap v2.
   */
  const getReserves = (): Promise<[BigNumber, BigNumber, number]> => {
    return ETHDAIPool.connect(provider).getReserves();
  };

  /**
   * @description updates the state if the user has given enough allowance to the uniswap router in
   * order to make the trade happen.
   * @param ownerAddress address of the token owner.
   * @param userAmount the amount of the owner that he wants to spend.
   */
  const allowance = async (ownerAddress: string, userAmount: BigNumber) => {
    const amount: BigNumber = await DAIContract.connect(provider).allowance(
      ownerAddress,
      UNISWAP_ROUTER_V2
    );
    setHasEnoughAllowance(() => amount.gte(userAmount));
  };

  /**
   * @param amount amount willing to spend.
   * @returns TransactionResponse that would fire a callback when the transaction is mined.
   */
  const approve = async (amount: BigNumber) => {
    const data = erc20Interface.encodeFunctionData("approve", [
      UNISWAP_ROUTER_V2,
      amount,
    ]);
    return provider.getSigner().sendTransaction({ to: DAI_MAINNET, data });
  };

  /**
   * @description internal function for calculating a uniswap trade.
   * @param uniswapReserves object that holds the current reserves of a pool.
   * @param maxDAIIn the amount of DAI the user is willing to spend.
   * @returns a trade uniswap class
   */
  const calculateUniswapTrade = (
    uniswapReserves: UniswapReserves,
    maxDAIIn: string
  ) => {
    const pair = new Pair(
      new TokenAmount(DAI, uniswapReserves.balanceToken0.toString()),
      new TokenAmount(WETH[1], uniswapReserves.balanceToken1.toString())
    );
    const route = new Route([pair], DAI);
    const trade = new Trade(
      route,
      new TokenAmount(DAI, parseUserInput(maxDAIIn).toString()),
      TradeType.EXACT_INPUT
    );
    return trade;
  };

  /**
   * @description will init the transaction for the specified DAI amount the user is willing to spent.
   * @param uniswapReserves object that holds the current reserves of a pool.
   * @param maxDAIIn the amount of DAI the user is willing to spend.
   * @param address of the recipient.
   * @param deadline specified in unix.
   * @returns TransactionResponse that would fire a callback when the transaction is mined.
   */
  const swap = async (
    uniswapReserves: UniswapReserves,
    maxDAIIn: string,
    address: string,
    deadline: number
  ) => {
    const trade = calculateUniswapTrade(uniswapReserves, maxDAIIn);
    const data = uniswapRouterV2Interface.encodeFunctionData(
      "swapTokensForExactETH",
      [
        trade.minimumAmountOut(new Percent("50", "10000")).raw.toString(),
        parseUserInput(maxDAIIn),
        [trade.route.path[0].address, trade.route.path[1].address],
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

  /**
   * @dev only used when chainID is 1337 and
   * @param account recipient
   */
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
