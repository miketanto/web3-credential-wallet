import axios from 'axios'
import { ethers, Contract } from 'ethers'
import {
  erc1155nftaddress,
  erc1155nftmarketaddress,
  nftaddress, nftmarketaddress,
} from '../configs/contracts/contract_config'
import {
  GiesCoin, MerchCoin, NFT, NFTMarket, ERC1155Market, ERC1155NFT,
} from '../contracts'

/**
 * Function: loadMarketNFTs
 * Use: Load NFTs currently in the market
 * @param {Contract} NFTMarket
 * @param {Contract} NFT
 * @returns {items}
 * * */
export async function loadMarketNFTs() {
  const data = await ERC1155Market.fetchMarketItems()
  console.log(data)
  const items = await Promise.all(data.map(async (i) => {
    const tokenUri = await ERC1155NFT.uri(i.tokenId)
    const meta = await axios.get(tokenUri)
    const price = i.currentPrice != undefined ? ethers.utils.formatUnits(i.currentPrice.toString(), 'ether') : 0
    const item = {
      price,
      itemId: Number(i.itemId),
      tokenId: Number(i.tokenId),
      category: Number(i.category),
      creator: i.creator,
      currentOwner: i.currentOwner,
      listed: i.listed,
      saleIndex: i.saleIndex,
      nftContract: i.nftContract,
      image: meta.data.image,
      name: meta.data.name,
      description: meta.data.description,
      royalty: i.royalty.toString(),
      quantity: meta.data.quantity,
      tags : meta.data.tags,
      useGco: i.useGco
    }
    return item
  }))
  return items
}

/**
 * Function: loadCreatedNFTs
 * Use: load NFTs created by user
 * @param {Contract} NFTMarket
 * @param {Contract} NFT
 * @returns {items}
 * * */

export async function loadCreatedNFTs() {
  const data = await ERC1155Market.fetchItemsCreated()

  const items = await Promise.all(data.map(async (i) => {
    const tokenUri = await ERC1155NFT.uri(i.tokenId)
    const meta = await axios.get(tokenUri)
    const price = ethers.utils.formatUnits(i.price.toString(), 'ether')
    const item = {
      price,
      itemId: Number(i.itemId),
      tokenId: Number(i.tokenId),
      category: Number(i.category),
      creator: i.creator,
      currentOwner: i.currentOwner,
      listed: i.listed,
      saleIndex: i.saleIndex,
      nftContract: i.nftContract,
      image: meta.data.image,
      name: meta.data.name,
      description: meta.data.description,
    }
    return item
  }))
  return items
}

/**
 * Function: buyNft
 * Use: buy an nft
 * @param {Object} nft
 * @param {Contract} NFTMarket
 * @param {Contract} NFT
 * @returns {items}
 * * */
export async function buyNft(nft, signer) {
  const signedNFTMarket = ERC1155Market.connect(signer)
  const signedGiesCoin = GiesCoin.connect(signer)
  const signedMerchCoin = MerchCoin.connect(signer)

  const useGco = nft.useGco
  
  const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
  console.log("Price: " + price)

  if(useGco){
    const allowance = await signedGiesCoin.allowance(signer._address, erc1155nftmarketaddress)
    console.log("Allowance: " + allowance)
    if (allowance < price) {
      let transaction = await signedGiesCoin.approve(erc1155nftmarketaddress, price)
      let tx = await transaction.wait();
      console.log("GCO Spending limit approved.");
      console.log(tx);
    }
  }else{
    const allowance = await signedMerchCoin.allowance(signer._address, erc1155nftmarketaddress)
    console.log("Allowance: " + allowance)
    if (allowance < price) {
      console.log("here")
      let transaction = await signedMerchCoin.approve(erc1155nftmarketaddress, price)
      let tx = await transaction.wait();
      console.log("MCO Spending limit approved.");
      console.log(tx);
    }  
  }
 
  let transaction = await signedNFTMarket.createMarketSale(erc1155nftaddress, nft.itemId)
  let tx = await transaction.wait();
  console.log("Sale completed.")
  console.log(tx);

  const items = await loadMarketNFTs()
  return (items)
}

export async function loadUserNFTs(account) {
  const data = await NFTMarket.fetchMyNFTs({ from: account })
  console.log(data)
  const items = await Promise.all(data.map(async (i) => {
    const tokenUri = await NFT.tokenURI(i.tokenId).call()
    console.log(tokenUri)
    console.log(i.seller)
    const meta = await axios.get(tokenUri)
    const price = ethers.utils.formatUnits(i.price.toString(), 'ether')
    const item = {
      price,
      tokenId: Number(i.tokenId),
      seller: i.seller,
      owner: i.owner,
      sold: i.sold,
      image: meta.data.image,
      name: meta.data.name,
    }
    return item
  }))
  return items
}

/**
 * Function: sellNft
 * Use: sell an nft
 * @param {Object} nft
 * @param {address} lister
 * @param {uint} price
 * @param {Contract} NFTMarket
 * @param {Contract} NFT
 * @returns {items}
 * * */
export async function sellNft(nft, lister, price) {
  let listingPrice = await NFTMarket.methods.getListingPrice().call()
  listingPrice = listingPrice.toString()
  const sellPrice = ethers.utils.parseUnits(price.toString(), 'ether')
  let transaction = await GiesCoin.approve(nftmarketaddress, listingPrice)
  transaction = await NFTMarket.createMarketItem(nftaddress, nft.tokenId, sellPrice)
  const items = await loadUserNFTs(lister)
  return (items)
}

/**
 * Function: mintMarketItem
 * Use: minting an nft
 * @param {String} url
 * @param {Address} signer = library.getSigner(account)
 * @returns {items}
 * * */

export async function mintMarketItem(url, signer,amount,royalty) {
  /* next, create the item */
  console.log(signer)
  console.log(ERC1155NFT)
  
  const signedNFT = ERC1155NFT.connect(signer)
  const signedNFTMarket = ERC1155Market.connect(signer)
  const signedGiesCoin = GiesCoin.connect(signer)

  let transaction = await signedNFT.createToken(amount, url)
  let receipt = await transaction.wait()
  const event = receipt.events[0]
  console.log(event)
  const value = event.args.id
  const tokenId = Number(value)
  console.log(tokenId)

  // const price = ethers.utils.parseUnits(formInput.price, 'ether')

  let listingPrice = await signedNFTMarket.getListingPrice()
  listingPrice = listingPrice.toString()
  console.log(listingPrice)

  transaction = await signedGiesCoin.approve(erc1155nftmarketaddress, listingPrice)
  receipt = await transaction.wait()
  // TODO:: for loop here
  let itemId = null;
  
  console.log(amount)
  for (let i = 0; i < amount; i++) {
    transaction = await signedNFTMarket.createMarketItem(erc1155nftaddress, tokenId, amount,royalty)
    receipt = await transaction.wait()
    if(i === 0)itemId = receipt.events[0].args[0].toString()
  }
  return {tokenId, itemId}
}

/**
 * Function: listMarketItem
 * Use: list an nft to E1155Market
 * @param {Object} nft
 * @param {address} lister
 * @param {uint} price
 * @returns {items}
 * * */

 export async function listMarketItem(nftId, lister, account, price, useGco) {
  // verify signer
  console.log(account)
  console.log(lister)
  const signedNFT = ERC1155NFT.connect(lister)
  const signedNFTMarket = ERC1155Market.connect(lister)
  const signedGiesCoin = GiesCoin.connect(lister)
  
  let transaction = await signedNFT.setApprovalForAll(erc1155nftmarketaddress, true);
  let receipt = await transaction.wait()
  
  let listingPrice = await signedNFTMarket.getListingPrice()
  listingPrice = listingPrice.toString()
  console.log(listingPrice)
  const sellPrice = ethers.utils.parseUnits(price.toString(), 'ether')

  console.log("sell price: " + price)
  console.log("nftId: " + nftId)
  transaction = await signedGiesCoin.approve(erc1155nftmarketaddress, listingPrice)
  receipt = await transaction.wait()

  transaction = await signedNFTMarket.createMarketListing(nftId, sellPrice, useGco)
  receipt = await transaction.wait();
 
  console.log("LISTED")
  
}

export async function getAmountListed(nftId) {
  const amount = await ERC1155NFT.balanceOf(erc1155nftmarketaddress, nftId)
  return parseInt(amount._hex, 16)
}

