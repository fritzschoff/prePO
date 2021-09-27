# Getting Started

This interface lets you swap DAI to ETH on Uniswap V2. It uses the UniswapRouterV2 contract in order to do so.
This application works only on mainnet or on a local testnet.
If you want to test the app locally, you would need to create your own hardhat.config.js file.
Example:

```javascript
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: "JSONRPC URL",
      },
    },
  },
};
```

If you created your config file, you can spin up a node with the command: `npx hardhat node`.

## Hosted

This app is hosted on heroku: https://boiling-shelf-72320.herokuapp.com/

### Fixed ETH - DAI Pool

This application uses fixed address for the ETH - DAI pool. For a real application this shouldn't be a hardcoded address.
We would need to check liquidity inside all ETH and DAI pools on Uniswap and would determine if the specified trade by the user
is possible but due to the time constraint, I had to skip that.

### Build in Faucet

If you are on the local testnet from hardhat you can swap your ETH to DAI in order to test this application.
This would be removed if this was a real application. For test reasons, I didn't removed this part of the application.

### &nbsp

I'm using HTML entities for whitespaces in places where I need to ensure that there is a whitespace. For example in a text that contains a link,
we need to make sure that there is a space between the last character of the text and the anchor tag. For me this more convenient then the suggested
`{' '}` from prettier.

## Dependencies

### web3-react

A very convenient library that has handles all use cases that this application needs in context of connecting to the meta mask browser extension.

### ethersjs

I have chosen this library cause it can handle human readable ABIs and it also works with `web3-react` library.

### @uniswap/sdk

This library is used to calculate everything this application needs for the swap transaction (route and expected return of ETH).

## Tests

There are some basic test in this repo but it could definitely be more but due to my full time job at AAVE, there was no time left.
