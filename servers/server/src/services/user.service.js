import httpStatus from 'http-status'
import { ethers, utils } from 'ethers'

import { envVars } from '../config'
import { provider } from '../constants'
import { GiesCoin, MerchCoin } from '../contracts'
import { Wallets } from '../models'
import { getAddressOfWallet, ApiError } from '../utils'

const deployer = new ethers.Wallet(envVars.replenish.privateKey, provider)

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
    const noWalletExists = !walletRecords || walletRecords.length === 0

    let addresses
    if (noWalletExists) {
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
      // console.log(wallet)
      addresses = getAddressOfWallet(wallet, 0, 2)
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

    const tx3 = await deployer.sendTransaction({
      to: nftMarketAddr,
      // Convert currency unit from ether to wei
      value: ethers.utils.parseEther('0.01'),
    })
    console.log(tx3)
    // }

    return { skillsWallet: skillsWalletAddr, nftMarket: nftMarketAddr }
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
    const marketplaceAddr = getAddressOfWallet(wallet, 1, 1)
    return {
      ETH: await provider.getBalance(marketplaceAddr),
      GCO: await GiesCoin.balanceOf(marketplaceAddr),
      MCO: await MerchCoin.balanceOf(marketplaceAddr),
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
