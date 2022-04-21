var Admin = artifacts.require("./Admin.sol");
var GiesCoin = artifacts.require("./GiesCoin.sol");
var MerchCoin = artifacts.require("./MerchCoin.sol");
var UtilFunctions = artifacts.require("UtilFunctions");
var Accessibility = artifacts.require("Accessibility");
var NFT = artifacts.require("./NFT.sol")
var NFTMarket = artifacts.require('./NFTMarket.sol')
var ERC1155Market = artifacts.require('./ERC1155Market.sol')
var ERC1155NFT = artifacts.require('./ERC1155NFT.sol')
var fs = require('fs');

const doDeploy = async function doDeploy (deployer,accounts) { 


    
    const first_admin = accounts[0];
    const DLab_index = accounts.length - 1 ; 
    const DLab_address = accounts[DLab_index];
    // should be read from config file
    await deployer.deploy(UtilFunctions);
    await deployer.deploy(Accessibility);
    await deployer.link(UtilFunctions,[Admin, GiesCoin,MerchCoin]);
    await deployer.link(Accessibility,[Admin, GiesCoin,MerchCoin]);
    await deployer.deploy(Admin, first_admin);
    const admin = await Admin.deployed();
    await deployer.deploy(GiesCoin,10000, admin.address);
    const gcotoken = await GiesCoin.deployed();
    await deployer.deploy(MerchCoin, 10000, admin.address);
    const mcotoken = await MerchCoin.deployed();
    await deployer.deploy(NFTMarket, mcotoken.address,gcotoken.address);
    const market = await NFTMarket.deployed();
    await deployer.deploy(NFT,market.address);
    const nft = await NFT.deployed();
    await deployer.deploy(ERC1155Market, mcotoken.address,gcotoken.address);
    const erc1155market = await ERC1155Market.deployed();
    await deployer.deploy(ERC1155NFT,erc1155market.address, "https://ipfs.infura.io/ipfs/");
    const tx = await mcotoken.makeApproved(erc1155market.address);
    //await deployer.deploy(Marketplace, MerchCoin.address, Admin.address, DLab_address);

    console.log("Admin.address",Admin.address);
    console.log("GiesCoin.address",GiesCoin.address);
    console.log("MerchCoin.address",MerchCoin.address);
    console.log("NFT.address",NFT.address);
    console.log("NFTMarket.address",NFTMarket.address);

    const _addressBook = {
        "Admin" : Admin.address,
        "GiesCoin" : GiesCoin.address,
        "MerchCoin" : MerchCoin.address,
        "NFT" : NFT.address,
        "NFTMarket" : NFTMarket.address,
        "ERC1155Market" : ERC1155Market.address,
        "ERC1155NFT": ERC1155NFT.address,
    };
    const addressBook = JSON.stringify(_addressBook);
    fs.writeFile( __dirname + '/../build/contractAddress.json', addressBook, function(err, result) {
        if(err) console.log('error', err);
    });
};


module.exports = function(deployer,network, accounts) {
    deployer.then( async() => await doDeploy(deployer,accounts));
};
    



 
// module.exports = function(deployer) {
// //   deployer.deploy(Ownership);
// //   deployer.deploy(UtilFunctions);
// //   deployer.deploy(Accessibility);
//   deployer.deploy(Admin, first_admin).then(function () {
//       deployer.deploy(GiesCoin,200, "Gies Coin", "GCO", Admin.address).then(function () {
//           deployer.deploy(MerchCoin,200, "Merch Coin", "MCO", Admin.address).then(function () {
//               deployer.deploy(Marketplace,MerchCoin.address, Admin.address, DLab_address)
//           })
//       })
//   });
// };



// module.exports = function(deployer) {
//       deployer.deploy(Ownership);
//       deployer.deploy(UtilFunctions);
//       deployer.deploy(Accessibility);
// };