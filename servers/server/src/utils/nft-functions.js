import axios from 'axios'
import { ethers, Contract } from 'ethers'

import {
  erc1155nftaddress,
  erc1155nftmarketaddress,
  nftaddress, nftmarketaddress,
} from '../contracts/config'
import {
  GiesCoin, MerchCoin, NFT as NFTContract, NFTMarket, ERC1155Market, ERC1155NFT,
} from '../contracts'
import { provider } from '../constants'

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
  // nft items
  return Promise.all(data.map(async (i) => {
    const tokenUri = await ERC1155NFT.uri(i.tokenId)
    const meta = await axios.get(tokenUri)
    const price = i.currentPrice !== undefined ? ethers.utils.formatUnits(i.currentPrice.toString(), 'ether') : 0
    return { // item data
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
      tags: meta.data.tags,
      useGco: i.useGco,
    }
  }))
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
export async function buyNFT(NFT, signer) {
  const signedNFTMarket = ERC1155Market.connect(signer)
  const signedGiesCoin = GiesCoin.connect(signer)
  const signedMerchCoin = MerchCoin.connect(signer)

  const { useGco: useGCO } = NFT

  const price = ethers.utils.parseUnits(NFT.price.toString(), 'ether')
  console.log(`Price: ${price}`)

  if (useGCO) {
    const allowance = await signedGiesCoin.allowance(signer._address, erc1155nftmarketaddress)
    console.log(`Allowance: ${allowance}`)
    if (allowance < price) {
      const transaction = await signedGiesCoin.approve(erc1155nftmarketaddress, price)
      const tx = await transaction.wait()
      console.log('GCO Spending limit approved.')
      console.log(tx)
    }
  } else {
    const allowance = await signedMerchCoin.allowance(signer._address, erc1155nftmarketaddress)
    console.log(`Allowance: ${allowance}`)
    if (allowance < price) {
      console.log('here')
      const transaction = await signedMerchCoin.approve(erc1155nftmarketaddress, price)
      const tx = await transaction.wait()
      console.log('MCO Spending limit approved.')
      console.log(tx)
    }
  }

  const transaction = await signedNFTMarket.createMarketSale(erc1155nftaddress, NFT.itemId)
  const tx = await transaction.wait()
  console.log('Sale completed.')
  console.log(tx)

  return loadMarketNFTs()
}

export async function loadUserNFTs(account) {
  const data = await NFTMarket.fetchMyNFTs({ from: account })
  console.log(data)
  const items = await Promise.all(data.map(async (i) => {
    const tokenUri = await NFTContract.tokenURI(i.tokenId).call()
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
export async function sellNFT(nft, lister, price) {
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

export async function mintMarketItem(url, signer, amount, royalty) {
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

  console.log(amount)

  // Automatically choose create functions based on input amount
  if (amount > 1) transaction = await signedNFTMarket.createMultiMarketItem(erc1155nftaddress, tokenId, 1, royalty, amount)
  else transaction = await signedNFTMarket.createMarketItem(erc1155nftaddress, tokenId, 1, royalty)

  receipt = await transaction.wait()
  const itemId = receipt.events[0].args[0].toString() || null
  console.log(itemId)

  return { tokenId, itemId }
}
/**
 * Function: listMarketItem
 * Use: list an nft to E1155Market
 * @param {number} nftId
 * @param {address} lister Signer
 * @param {number} price
 * @param {boolean} useGco
 * @param {number} amount
 * @returns {items}
 * * */

 export async function listMarketItem(nftId, lister, account, price, useGco,amount) {
  // verify signer
  console.log(amount)
  lister = provider.getSigner()
  console.log(lister)
  const signedNFT = ERC1155NFT.connect(lister)
  const signedNFTMarket = ERC1155Market.connect(lister)
  const signedGiesCoin = GiesCoin.connect(lister)
  
  let transaction = await signedNFT.setApprovalForAll(erc1155nftmarketaddress, true);
  let receipt = await transaction.wait()
  
  let listingPrice = await signedNFTMarket.getListingPrice()
  listingPrice = listingPrice.toString()
  let ethListingPrice = ethers.utils.formatEther(listingPrice)
  ethListingPrice = ethListingPrice * amount
  console.log(ethListingPrice)
  listingPrice =  ethers.utils.parseUnits(ethListingPrice.toString(), 'ether')
  console.log(listingPrice.toString())
  const sellPrice = ethers.utils.parseUnits(price.toString(), 'ether')

  console.log("sell price: " + price)
  console.log("nftId: " + nftId)
  transaction = await signedGiesCoin.approve(erc1155nftmarketaddress,listingPrice)
  receipt = await transaction.wait()

  if(amount>1){
    transaction = await signedNFTMarket.createMultiMarketListing(nftId, sellPrice, useGco,amount)
    receipt = await transaction.wait();
  }else{
    console.log(nftId)
    console.log(sellPrice.toString())
    const stringSellPrice = sellPrice.toString()
    console.log(useGco)
    transaction = await signedNFTMarket.createMarketListing(nftId, sellPrice, useGco)
    receipt = await transaction.wait();
  }
 
  console.log("LISTED")
  
}

export async function getAmountListed(nftId) {
  const amount = await ERC1155NFT.balanceOf(erc1155nftmarketaddress, nftId)
  return parseInt(amount._hex, 16)
}

export async function getNFTBalance(account, nftId) {
  const amount = await ERC1155NFT.balanceOf(account, nftId)
  return parseInt(amount._hex, 16)
}
