# Basic Sample Hardhat Project

clone the repo with :
```shell
git clone https://github.com/satoshi-u/nft-marketplace
```

do an npm install for installing project dependencies : 
```shell
npm install
```

The NFT & NFTMarket contracts are already deployed in polygon-testnet. Addresses inside config.js :

NFT address :
```shell
0xB01104580f61f2027d385B52179A8f2051b7E64A
```
NFTMarket address :
```shell
0xdDAD898Dd23A50F699fD1Aa77eD37059DAC4AFb0
```

To start the Next.js frontend, run :
```shell
npm run dev
```

Now, go to localhost:3000 and connect to the Polygon Testnet via Metamask or similar wallet :
```shell
https://docs.unbound.finance/guides/guide-to-accessing-polygon-testnet-and-how-to-use-unbound-faucet-tokens
```

Get some test-matic tokens in your wallet account(s) : 
```shell
https://faucet.polygon.technology/
```

You are ready to buy/sell NFTs via the UI.

Note: Project uses hardhat for local solidity dev. Use following to compile/test contracts :
```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
