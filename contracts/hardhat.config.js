require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    iblock: {
      url: "https://141.142.218.249:10000",
      accounts: ["0x69633b10bc3b5d1f5febc312460f235a4b4a64247b2c3b144292500729ff8826"],
      chainId: 1515,
      gas: 210000000,
      gasPrice: 1000000000,
    }
}
}