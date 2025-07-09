require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    blockdag: {
      url: process.env.BLOCKDAG_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1043,
    },
  },
};
