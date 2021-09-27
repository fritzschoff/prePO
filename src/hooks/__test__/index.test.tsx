import { providers } from "ethers";
import { useERC20 } from "../ERC20";
import { renderHook } from "@testing-library/react-hooks";

test("parseUserInput should handle a decimal in the input", () => {
  const { result } = renderHook(() => useERC20({} as providers.Web3Provider));
  const daiWithDecimal = result.current.parseUserInput("2.2");
  expect(daiWithDecimal.toString()).toEqual("2200000000000000000");
  expect(daiWithDecimal.toString().length).toEqual(19);
  const daiWithoutDecimal = result.current.parseUserInput("11");
  expect(daiWithoutDecimal.toString()).toEqual("11000000000000000000");
  expect(daiWithoutDecimal.toString().length).toEqual(20);
});
