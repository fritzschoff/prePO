import { Interface } from "@ethersproject/abi";

export const erc20Interface = new Interface([
  "function balanceOf(address owner) view",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) view returns(uint256)",
]);

export const uniswapV2PairInterface = new Interface([
  `function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)`,
]);

export const uniswapRouterV2Interface = new Interface([
  `function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
  external returns (uint[] memory amounts)`,
]);
