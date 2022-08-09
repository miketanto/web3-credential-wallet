import express from 'express'
import passport from 'passport'

import validate from '../../middlewares/validate'
import { userService } from '../../services'
import { catchAsync, pick } from '../../utils'
import { userValidation } from '../../validations'
import { getWalletFromEmail } from '../../middlewares'

const router = express.Router()

/**
 * Calling this route will auto-associate new user to a new wallet
 * NOTE: this is the only auto-associating endpoint, thus it must be called before any
 *       wallet interactions for users
 */
router.get(
  '/address',
  passport.authenticate('bearer', { session: false }),
  catchAsync(async (req, res, next) => {
    const { user } = req // populated by Passport.js
    const addresses = await userService.address({ user })
    res.locals = { addresses } // TODO: Remove redundancy by doing `res.locals = addresses` instead
    next()
  }),
)

router.get(
  '/balance',
  passport.authenticate('bearer', { session: false }),
  getWalletFromEmail(),
  catchAsync(async (req, res, next) => {
    res.locals = await userService.balance({ user: req.user })
    console.log("Balance: ", res.locals) //Testing, equivalent in website/serer/src/services/user.service.js -- this one actually does something
    next()
  }),
)

router.get(
  '/search',
  validate(userValidation.search),
  catchAsync(async (req, res, next) => {
    const options = pick(req.query, ['email'])
    const addresses = await userService.search(options)
    res.locals = { addresses }
    if (!addresses.skillsWallet) {
      res.locals.msg = 'User not found'
    }
    next()
  }),
)

// router.post('/replenish', validate(addressValidation.needAddressPost), catchAsync(async (req, res, next) => {
//   const options = pick(req.body, ['address'])
//   const { balance, isReplenished } = await addressService.replenish(options)
//   res.locals = { balance, isReplenished }
//   next()
// }))

export default router
