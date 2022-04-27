import axios from 'axios'
import express from 'express'
import openIDConnect from 'express-openid-connect'
import passport from 'passport'

import { getWalletFromEmail, getWalletSigner, validate } from '../../middlewares'
import { summitService } from '../../services'
import { catchAsync, pick } from '../../utils'
import { summitValidation } from '../../validations'

const router = express.Router()

function getEmailInBearerAuth0() {
  return (req, res, next) => {
    req.user.email = req.user.decoded['https://iblockcore.com/email']
    next()
  }
}

//
router.post(
  '/associate',
  validate(summitValidation.associate),
  passport.authenticate('bearer-auth0', { session: false }),
  // move for key compatibility
  getEmailInBearerAuth0(),
  // regenerateSessionAfterAuthentication,
  catchAsync(async (req, res, next) => {
    const options = pick(req.body, ['address'])
    const status = await summitService.associate({ ...options, user: req.user })
    res.locals = { status }
    next()
  }),
)

router.get(
  '/get-associated',
  passport.authenticate('bearer-auth0', { session: false }),
  getEmailInBearerAuth0(),
  // regenerateSessionAfterAuthentication,
  catchAsync(async (req, res, next) => {
    const address = await summitService.getAssociated({ user: req.user })
    res.locals = { address }
    next()
  }),
)

//
router.get(
  '/custodial',
  // openIDConnect.requiresAuth(),
  passport.authenticate('bearer-auth0', { session: false }),
  getEmailInBearerAuth0(),
  getWalletFromEmail(),
  getWalletSigner('skills'),
  catchAsync(async (req, res, next) => {
    // console.log(req.user)
    const address = await summitService.custodial({ user: req.user })
    res.locals = { address }
    next()
  }),
)

//
router.post(
  '/mint',
  passport.authenticate('bearer-auth0', { session: false }),
  getEmailInBearerAuth0(),
  catchAsync(async (req, res, next) => {
    const transactionHash = await summitService.mint({ user: req.user })
    res.locals = { transaction: transactionHash }
    next()
  }),
)

export default router
