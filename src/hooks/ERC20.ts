import { TransactionRequest } from "@ethersproject/abstract-provider";
import { BigNumber, providers, Contract, utils } from "ethers";
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
  const erc20Contract = new Contract(DAI_MAINNET, erc20Interface);
  const ETHDAIPool = new Contract(ETH_DAI_POOL, uniswapV2PairInterface);
  const balanceOf = (userAddress: string): Promise<BigNumber> => {
    const erc20Contract = new Contract(DAI_MAINNET, erc20Interface, provider);
    return erc20Contract.balanceOf(userAddress);
  };

  const parseUserInput = (userInput: string) => {
    if (userInput.charAt(0) === "0" || userInput.charAt(0) === ".") {
      const parsedUserInput = userInput
        .slice(userInput.indexOf(".") + 1)
        .replaceAll(",", "");
      return BigNumber.from(parsedUserInput).mul(
        BigNumber.from("10").pow(
          BigNumber.from(18 - Number(parsedUserInput.length))
        )
      );
    }
    return BigNumber.from(userInput.replace(".", "")).mul(
      BigNumber.from("10").pow(BigNumber.from("18"))
    );
  };

  const getReserves = (): Promise<[BigNumber, BigNumber, number]> => {
    return ETHDAIPool.connect(provider).getReserves();
  };

  const allowance = async (ownerAddress: string): Promise<BigNumber> => {
    return erc20Contract
      .connect(provider)
      .allowance(ownerAddress, UNISWAP_ROUTER_V2);
  };

  const approve = async (amount: BigNumber) => {
    const data = erc20Interface.encodeFunctionData("approve", [
      UNISWAP_ROUTER_V2,
      amount,
    ]);
    return provider.getSigner().sendTransaction({ to: DAI_MAINNET, data });
  };

  const swap = async (
    minETHOut: string,
    maxDAIIn: string,
    address: string,
    deadline: number
  ) => {
    // TODO @MF 1 calculated the return value
    const data = uniswapRouterV2Interface.encodeFunctionData(
      "swapTokensForExactETH",
      [1, parseUserInput(maxDAIIn), tradeRoute, address, deadline]
    );
    const tx: TransactionRequest = {
      to: UNISWAP_ROUTER_V2,
      data,
    };
    return provider.getSigner().sendTransaction(tx);
  };

  return { balanceOf, getReserves, swap, approve, allowance, parseUserInput };
}
