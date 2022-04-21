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
import useActiveWeb3React from '../hooks/useActiveWeb3React'
/**
 * Function: loadMarketNFTs
 * Use: Load NFTs currently in the market
 * @param {Contract} NFTMarket
 * @param {Contract} NFT
 * @returns {items}
 * * */
export async function loadMarketNFTs() {
  const data = await ERC1155Market.fetchMarketItems()
  const items = await Promise.all(data.map(async (i) => {
    const tokenUri = await ERC1155NFT.uri(i.tokenId)
    const meta = await axios.get(tokenUri)
    const price = i.price != undefined ? ethers.utils.formatUnits(i.price.toString(), 'ether') : 0
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
export async function buyNft(nft) {
  const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
  let transaction = await GiesCoin.approve(nftmarketaddress, price)
  transaction = await ERC1155Market.createMarketSale(nftaddress, nft.itemId)
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

export async function mintMarketItem(url, signer,amount) {
  /* next, create the item */
  console.log(ERC1155NFT)
  
  const signedNFT = ERC1155NFT.connect(signer)
  const signedNFTMarket = ERC1155Market.connect(signer)
  const signedGiesCoin = GiesCoin.connect(signer)

  let transaction = await signedNFT.createToken(1, url)
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

  transaction = await signedNFTMarket.createMarketItem(erc1155nftaddress, tokenId, amount)
  receipt = await transaction.wait()
  console.log(receipt.events[0].args[0].toString())
}

/**
 * Function: listMarketItem
 * Use: list an nft to E1155Market
 * @param {Object} nft
 * @param {address} lister
 * @param {uint} price
 * @returns {items}
 * * */

 export async function listMarketItem(nftId, lister,account, price) {
  // verify signer
  console.log(lister)
  const signedNFTMarket = ERC1155Market.connect(lister)
  const signedGiesCoin = GiesCoin.connect(lister)

  let listingPrice = await signedNFTMarket.getListingPrice()
  listingPrice = listingPrice.toString()
  console.log(listingPrice)
  const sellPrice = ethers.utils.parseUnits(price.toString(), 'ether')

  console.log("sell price: " + price)
  console.log("nftId: " + nftId)
  let transaction = await signedGiesCoin.approve(erc1155nftmarketaddress, listingPrice)
  let receipt = await transaction.wait()

  transaction = await signedNFTMarket.createMarketListing(nftId, sellPrice)
  receipt = await transaction.wait();
  console.log("LISTED")
  
}

