import httpStatus from 'http-status'

import { provider } from '../constants'
import { getSignerFromWallet, ApiError } from '../utils'

/**
 * Gets wallet signer from given wallet
 * @param target `skills` or `nft` to pick address of wallet
 */
export default function getWalletSigner(target) {
  return async (req, res, next) => {
    if (!req.user || !req.user.wallet) {
      return next(new ApiError(httpStatus.BAD_REQUEST, 'Could not retrieve email from JWT'))
    }

    // Attach signer & its address
    req.user.signer = getSignerFromWallet(req.user.wallet, provider, target)
    req.user.address = req.user.signer.address
    return next()
  }
}
