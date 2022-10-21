// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
var fs = require('fs');
const { ethers,config } = require("hardhat");



async function main() {
    const SkillsWallet = await ethers.getContractFactory("SkillsWallet");
    const UtilFunctions = await ethers.getContractFactory("UtilFunctions");
    const Accessibility = await ethers.getContractFactory("Accessibility");
    const Admin = await ethers.getContractFactory("Admin")
    const GiesCoin = await ethers.getContractFactory("GiesCoin")
    const MerchCoin = await ethers.getContractFactory("MerchCoin")
    const NFTMarket = await ethers.getContractFactory("NFTMarket")
    const ERC1155Market = await ethers.getContractFactory("ERC1155Market")
    const NFT = await ethers.getContractFactory("NFT")
    const ERC1155NFT = await ethers.getContractFactory("ERC1155NFT")

    const [owner] = await ethers.getSigners();

    await UtilFunctions.deploy();
    await Accessibility.deploy();
    //await UtilFunctions.link([Admin, GiesCoin,MerchCoin]);
    //await Accessibility.link([Admin, GiesCoin,MerchCoin]);
    const admin = await Admin.deploy(owner.address);
    await admin.deployed();
    const gcotoken =await GiesCoin.deploy(10000, admin.address);
    await gcotoken.deployed();
    const mcotoken = await MerchCoin.deploy(10000, admin.address);
    await mcotoken.deployed();
    const market = await NFTMarket.deploy(mcotoken.address,gcotoken.address);
    await market.deployed();
    const nft = await NFT.deploy(market.address);
    await nft.deployed();
    const erc1155market = await ERC1155Market.deploy(mcotoken.address,gcotoken.address);
    await erc1155market.deployed();
    const erc1155nft = await ERC1155NFT.deploy(erc1155market.address, "https://ipfs.infura.io/ipfs/");
    const tx = await mcotoken.makeApproved(erc1155market.address);

  const baseURI = "https://www.baseURI.com/"
  
  
  const skillswallet = await SkillsWallet.deploy(baseURI,owner.address);
  console.log(owner.address)

  const _addressBook = {
    "Admin" : admin.address,
    "GiesCoin" : gcotoken.address,
    "MerchCoin" : mcotoken.address,
    "NFT" : nft.address,
    "NFTMarket" : market.address,
    "ERC1155Market" : erc1155market.address,
    "ERC1155NFT": erc1155nft.address,
    "SkillsWallet" : skillswallet.address,
  };
  const addressBook = JSON.stringify(_addressBook);
  fs.writeFile( __dirname + '/../contractAddress.json', addressBook, function(err, result) {
      if(err) console.log('error', err);
  });
  const receipt = await skillswallet.deployed();

  console.log(
    `SkillsWallet Contract Deployed to Network`
  );
  const accounts = config.networks.hardhat.accounts;
  const index = 0; // first wallet, increment for next wallets
  const wallet1 = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${index}`);

  const privateKey1 = wallet1.privateKey
  console.log(privateKey1)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
