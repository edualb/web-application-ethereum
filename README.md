# **Getting Started**

* Install [MetaMask](https://metamask.io/) in your browser

* Install [truffle development environment](https://www.trufflesuite.com/truffle)

* Install [ganache](https://www.trufflesuite.com/ganache) to simulate a personal blockchain;

* Enter in MetaMask using MNEMONIC from ganache blockchain

* Config your MetaMask with ganache blockchain network (127.0.0.1:7545)

* Get some address in your personal ganache blockchain and put in deploy contract file  ( `3_deploy_contract.js` ):

```
    deployer.deploy(
      CrowdFundingWithDeadline,
      "Test campaign",
      1,
      200,
      "Your public address here"
    )
```

* Enter in crowdfunding folder and run:

   `$ truffle migrate --network development --reset`

* enter in front-end folder and run:

   `$ npm run start`

