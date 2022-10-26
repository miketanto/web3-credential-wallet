require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    iblock: {
      url: "http://141.142.216.212:9000",
      accounts: ["0x3a6d5ab328deb57cfc42d76472e4cdab80003d7391625fa18a66c80425d92ddb"],
      chainId: 1515,
      gas: 210000000,
      gasPrice: 1000000000,
    }
}
}