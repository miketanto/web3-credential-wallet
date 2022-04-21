import express from 'express'
import passport from 'passport'

import validate from '../../middlewares/validate'
import { userService } from '../../services'
import { catchAsync, pick } from '../../utils'
import { userValidation } from '../../validations'

const router = express.Router()

router.get(
  '/address',
  passport.authenticate('bearer', { session: false }),
  catchAsync(async (req, res, next) => {
    const { user } = req // populated by Passport.js
    const addresses = await userService.address({ user })
    res.locals = { addresses }
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
