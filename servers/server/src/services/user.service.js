import httpStatus from 'http-status'
import { ethers, utils } from 'ethers'

import { Wallets } from '../models'
import { getAddressOfWallet, ApiError } from '../utils'

function createNewWallet() {
  return ethers.Wallet.createRandom()
}

// eslint-disable-next-line import/prefer-default-export
export async function address(options) {
  try {
    const { user: { email } } = options

    const queryParams = {
      where: { email },
      attributes: ['main_address', 'seed_phrase'],
      raw: true,
    }

    const walletRecords = await Wallets.findAll(queryParams)

    let addresses
    if (!walletRecords || walletRecords.length === 0) {
      // no wallet exists
      const wallet = createNewWallet()
      addresses = getAddressOfWallet(wallet, 0, 2)

      // store new wallet data (wallet.address is address 0 - `m/44'/60'/0'/0/0`)
      const createParams = { email, main_address: wallet.address, seed_phrase: wallet.mnemonic.phrase }
      await Wallets.create(createParams)
    } else {
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
