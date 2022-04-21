import httpStatus from 'http-status'
import { ethers, utils } from 'ethers'

import Joi from 'joi'
import { envVars } from '../config'
import { provider } from '../constants'
import { GiesCoin, MerchCoin } from '../contracts'
import { Collections, Wallets } from '../models'
import { getAddressOfWallet, ApiError } from '../utils'
import { addressFilter } from '../validations/helper'
import { erc1155nftaddress } from '../contracts/config'

const deployer = new ethers.Wallet(envVars.replenish.privateKey, provider)

function createNewWallet() {
  return ethers.Wallet.createRandom()
}

/**
 * @param {address} creatorAddress
 * @param {string} name
 * @param {string} description
 * @return {Promise<T>}
 */
async function createNewCollection(creatorAddress, name, description) {
  const collectionId = await Collections.create({
    name,
    creator: creatorAddress,
    contract_address: erc1155nftaddress,
    description,
    no_items: 0,
    no_owners: 1,
    floor_price: 0,
    volume_traded: 0,
    website: null,
    discord: null,
    instagram: null,
    twitter: null,
  }).then((result) => result.collection_id)
    .catch((err) => { throw err })
  return collectionId
}

// eslint-disable-next-line import/prefer-default-export
export async function address(options) {
  try {
    const { user: { email, first_name: firstName, last_name: lastName } } = options

    const queryParams = {
      where: { email },
      attributes: ['main_address', 'seed_phrase'],
      raw: true,
    }

    const walletRecords = await Wallets.findAll(queryParams)
    const noWalletExists = !walletRecords || walletRecords.length === 0

    let addresses
    let collectionId
    if (noWalletExists) {
      // NO WALLET EXISTS

      // Create New Wallet
      const wallet = createNewWallet()
      addresses = getAddressOfWallet(wallet, 0, 2)

      // Store New Wallet Data (wallet.address is address 0 - `m/44'/60'/0'/0/0`)
      const createParams = { email, main_address: wallet.address, seed_phrase: wallet.mnemonic.phrase }
      await Wallets.create(createParams)

      // Create New Collection for user
      collectionId = createNewCollection(
        addresses[1], // use NFT address (index 1)
        `Collection by ${firstName} ${lastName}`,
        `Collection by ${firstName} ${lastName}`,
      )
    } else {
      // WALLET EXISTS
      const walletData = walletRecords[0]
      const wallet = utils.HDNode.fromMnemonic(walletData.seed_phrase)
      addresses = getAddressOfWallet(wallet, 0, 2)

      // Get Associated Collection Id
      const collectionRecord = await Collections.findOne({
        where: { creator: addresses[1] },
        raw: true,
      })

      if (!collectionRecord || !collectionRecord.collection_id) {
        // Create New Collection for existing user that doesn't have collection for some reason
        collectionId = createNewCollection(
          addresses[1], // use NFT address (index 1)
          `Collection by ${firstName} ${lastName}`,
          `Collection by ${firstName} ${lastName}`,
        )
      } else {
        // retrieve that existing collection id for the user
        collectionId = collectionRecord.collection_id
      }
    }

    const [skillsWalletAddr, nftMarketAddr] = addresses

    // TODO: uncomment if to mint/transfer only for new accounts
    // if (noWalletExists) {
    // Gies & Merch Coin
    const signedGiesCoin = GiesCoin.connect(deployer)
    const signedMerchCoin = MerchCoin.connect(deployer)

    const tx1 = await signedGiesCoin.mintFor(nftMarketAddr, 100 * 10e7)
    const tx2 = await signedMerchCoin.mintFor(nftMarketAddr, 100 * 10e7)
    console.log(tx1)
    console.log(tx2)
    //
    const tx3 = await deployer.sendTransaction({
      to: nftMarketAddr,
      // Convert currency unit from ether to wei
      // value: ethers.utils.parseEther('0.01'),
      value: ethers.utils.parseEther('10'),
    })
    console.log(tx3)
    // // }

    return { skillsWallet: skillsWalletAddr, nftMarket: nftMarketAddr, nftCollectionId: collectionId }
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function balance(options) {
  try {
    const { user: { wallet } } = options

    // Get idx = 1 for `nft marketplace` address associated with the user
    const addr = getAddressOfWallet(wallet, 1, 1)[0]

    const providerGiesCoin = GiesCoin.connect(provider)
    const providerMerchCoin = MerchCoin.connect(provider)

    return {
      ETH: (await provider.getBalance(addr)).toString(),
      GCO: (await providerGiesCoin.balanceOf(addr)).toString(),
      MCO: (await providerMerchCoin.balanceOf(addr)).toString(),
    }
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

// eslint-disable-next-line import/prefer-default-export
export async function search(options) {
  try {
    const { email } = options

    const queryParams = {
      where: { email },
      attributes: ['main_address', 'seed_phrase'],
      raw: true,
    }

    const walletRecords = await Wallets.findAll(queryParams)

    // Instead of throwing error on `no user found`,
    // return 200 (success) with wallet as empty object

    // if (!walletRecords || walletRecords.length === 0) {
    //   throw new ApiError(404, 'User not found')
    // }
    let addresses = [null, null]

    if (walletRecords && walletRecords.length > 0) {
      // wallet exists
      const walletData = walletRecords[0]
      const wallet = utils.HDNode.fromMnemonic(walletData.seed_phrase)
      addresses = getAddressOfWallet(wallet, 0, 2)
    }

    return {
      skillsWallet: addresses[0],
      nftMarket: addresses[1],
    }
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}
