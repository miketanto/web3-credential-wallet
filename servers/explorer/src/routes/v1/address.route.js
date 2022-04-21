import express from 'express'
import passport from 'passport'

import validate from '../../middlewares/validate'
import { addressValidation } from '../../validations'
import { pick, catchAsync } from '../../utils'
import { addressService } from '../../services'

const router = express.Router()

// router.get('/getOrCreate',
//   passport.authenticate('bearer', { session: false }),
//   // regenerateSessionAfterAuthentication,
//   catchAsync(async (req, res, next) => {
//     const { user } = req
//     const addresses = await addressService.getOrCreate({ user })
//     res.locals = { addresses }
//     next()
//   }))

router.get(
  '/associate',
  validate(addressValidation.associate),
  passport.authenticate('bearer', { session: false }),
  // regenerateSessionAfterAuthentication,
  catchAsync(async (req, res, next) => {
    const { user } = req // populated by Passport.js
    const options = pick(req.body, ['address'])
    const isAssociated = await addressService.associate({ ...options, user })
    res.locals = { isAssociated }
    next()
  }),
)

router.get('/associated', validate(addressValidation.associated), catchAsync(async (req, res, next) => {
  const options = pick(req.query, ['net_id'])
  const addresses = await addressService.getAssociated(options)
  res.locals = { addresses }
  next()
}))

router.get('/get-balance', validate(addressValidation.needAddress), catchAsync(async (req, res, next) => {
  const options = pick(req.query, ['address'])
  const balance = await addressService.getBalance(options)
  res.locals = { balance }
  next()
}))

// router.post('/replenish', validate(addressValidation.needAddressPost), catchAsync(async (req, res, next) => {
//   const options = pick(req.body, ['address'])
//   const { balance, isReplenished } = await addressService.replenish(options)
//   res.locals = { balance, isReplenished }
//   next()
// }))

export default router
