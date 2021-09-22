import type { BigNumber } from "ethers";

export interface SwapTransaction {
  daiBalance: BigNumber;
  ethBalance: BigNumber;
  amountToSend?: string;
  data?: string;
}

export interface UniswapReserves {
  price: string;
  balanceToken0: BigNumber;
  balanceToken1: BigNumber;
  lastUpdated: number;
}
