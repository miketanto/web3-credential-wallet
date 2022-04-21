import httpStatus from 'http-status'
import axios from 'axios'
import { ethers } from 'ethers'

import envVars from '../config/env-vars'
import { Assets, Collections } from '../models'
import { ApiError } from '../utils'
import { buyNFT, listMarketItem, mintMarketItem } from '../utils/nft-functions'

export async function get(options) {
  try {
    const { id, collectionId, owner } = options

    let data
    // NFT Item ID is provided, get that NFT
    if (id) data = await Assets.findOne({ where: { item_id: id } })
    // NFT Collection ID is provided, get that NFT Collection (of NFTs)
    else if (collectionId) data = await Assets.findAll({ where: { collection_id: collectionId } })
    // Owner is provided, get that owner's NFT Collection
    else if (owner) data = await Assets.findAll({ where: { current_owner: owner } })
    // Return all assets
    else data = await Assets.findAll({ include: { model: Collections } })

    return await Promise.all(data.map(async (i) => {
      const tokenUri = i.meta_url
      const meta = await axios.get(tokenUri)
      const price = i.price !== undefined ? ethers.utils.formatUnits(i.price.toString(), 'ether') : 0
      const item = {
        price: price.toString(),
        itemId: Number(i.item_id).toString(),
        tokenId: Number(i.token_id).toString(),
        creator: i.creator,
        currentOwner: i.current_owner,
        listed: i.listing_status,
        nftContract: i.asset_contract,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
        royalty: i.royalty.toString(),
        quantity: meta.data.quantity,
        tags: meta.data.tags,
        useGCO: (i.currency === 'GCO'),
      }
      return item
    }))
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

/**
 * Need to make it so that it checks whether it is a recognized account useBearerStrategy
 * Use account from jongwons endpoint
 * caller needs to pass in oid
 */
export async function create(options) {
  try {
    const {
      user: { address, signer },
      quantity, path, name, collection_id: collectionId,
      creator, nftContract, royalty, useGco: useGCO, listed, price,
    } = options
    console.log(address)
    const { tokenId, itemId } = await mintMarketItem(path, signer, quantity, royalty)

    const NFTs = []
    for (let i = 0; i < quantity; i++) {
      const NFT = {
        item_id: Number(itemId) + i,
        name,
        meta_url: `${envVars.ipfsBaseUrl}/${path}`,
        quantity,
        token_id: tokenId,
        collection_id: collectionId,
        listing_status: listed,
        asset_contract: nftContract,
        creator,
        royalty,
        likes: 0,
        price,
        current_owner: creator,
        currency: useGCO ? 'GCO' : 'MCO',
      }
      NFTs.unshift(NFT)
    }
    console.log('Created')
    return await Assets.bulkCreate(NFTs)
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function deleter(options) {
  try {
    const { id } = options
    return await Assets.destroy({ where: { market_id: id } })
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function update(options, NFT) {
  try {
    return await Assets.update(
      { ...NFT },
      { where: { market_id: options.id } },
    )
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function list(options, listingOptions) {
  try {
    const { user: { signer }, id } = options
    const { price, useGco: useGCO, amount } = listingOptions
    // console.log(options)
    // console.log(listingOptions)
    const listing = await listMarketItem(id, signer, price, useGCO, amount)
    return await Assets.update(
      {
        price,
        currency: useGCO ? 'GCO' : 'MCO',
        listing_status: true,
      },
      {
        where: { item_id: options.id },
      },
    )
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function buy(options) {
  try {
    const { user: { address, signer }, id } = options
    const data = await Assets.findOne({
      where: { item_id: id },
    })
    const nftData = {
      price: data.price,
      itemId: Number(data.item_id),
      tokenId: Number(data.token_id),
      useGco: (data.currency === 'GCO'),
    }
    const listing = await buyNFT(nftData, signer)
    return await Assets.update(
      {
        listing_status: false,
        current_owner: address,
      },
      {
        where: { item_id: id },
      },
    )
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}
