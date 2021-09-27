import { render, screen } from "@testing-library/react";
import Swap from "..";

test("Should render the swap component", () => {
  render(<Swap />);
  const defaultScreen = screen.getByText(/Please connect your wallet/i);
  expect(defaultScreen).toBeInTheDocument();
});
