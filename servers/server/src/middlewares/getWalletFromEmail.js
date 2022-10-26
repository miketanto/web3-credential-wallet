import httpStatus from 'http-status'

import { ethers, utils } from 'ethers'
import { Wallets } from '../models'
import { ApiError } from '../utils'

/**
 * Gets wallet from given email (acquired from Microsoft AAD JWT parsed through passport.js `bearer`)
 * `req.user` should be populated by passport.js middleware using `bearer` strategy
 */
export default function getWalletFromEmail() {
  return async (req, res, next) => {
    req = req.query
    if (!req.user || !req.user.email) {
      return next(new ApiError(httpStatus.BAD_REQUEST, 'Could not retrieve email from JWT'))
    }

    const { email } = req.user // populated by passport.js
    const queryParams = {
      where: { email },
      attributes: ['main_address', 'seed_phrase'],
      raw: true,
    }

    const walletRecords = await Wallets.findAll(queryParams)

    if (!walletRecords || walletRecords.length === 0) {
      // no wallet exists, create one
      // return next(new ApiError(httpStatus.BAD_REQUEST, `Wallet for user ${email} not found`))
      const wallet = ethers.Wallet.createRandom()

      // Store New Wallet Data (wallet.address is address 0 - `m/44'/60'/0'/0/0`)
      const createParams = { email, main_address: wallet.address, seed_phrase: wallet.mnemonic.phrase }
      await Wallets.create(createParams)
      req.user.wallet = wallet
    } else {
      // wallet exists, grab the wallet data & append that wallet to `req.user`
      const walletData = walletRecords[0]
      const wallet = utils.HDNode.fromMnemonic(walletData.seed_phrase)
      req.user.wallet = wallet
    }

    return next()
  }
}
