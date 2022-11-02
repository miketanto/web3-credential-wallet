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
      accounts: ["0xccbc7c99df116b98dcab367d486fd96c622bb7c311b3285c8e431411f272939a"],
      chainId: 1515,
      gas: 210000000,
      gasPrice: 1000000000,
    }
}
}