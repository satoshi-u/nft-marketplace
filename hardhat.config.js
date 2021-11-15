require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
const fs = require("fs");
const PROJECT_ID_INFURA = fs.readFileSync(".secret").toString();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${PROJECT_ID_INFURA}`,
      accounts: [`0x${process.env.ETH_MAIN_PVT}`]
    },
    mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${PROJECT_ID_INFURA}`,
      accounts: [`0x${process.env.ETH_MAIN_PVT}`]
    }
  },
  solidity: "0.8.4",
};
