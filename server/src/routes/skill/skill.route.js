import express from 'express'
import passport from 'passport'

import { getWalletFromEmail, getWalletSigner, validate } from '../../middlewares'
import { skillService } from '../../services'
import { catchAsync, pick } from '../../utils'
import { skillValidation } from '../../validations'

const router = express.Router()

// List all available skills
router.get(
  '/list',
  catchAsync(async (req, res, next) => {
    const skills = await skillService.listAll()
    res.locals = { skills }
    next()
  }),
)

router.post(
  '/create',
  validate(skillValidation.create),
  passport.authenticate('bearer', { session: false }),
  // regenerateSessionAfterAuthentication,
  getWalletFromEmail(),
  getWalletSigner('skills'),
  catchAsync(async (req, res, next) => {
    const options = pick(req.body, ['name', 'description'])
    const transactionHash = await skillService.create({ ...options, user: req.user })
    res.locals = { transaction: transactionHash }
    next()
  }),
)

router.post(
  '/mint',
  validate(skillValidation.mint),
  passport.authenticate('bearer', { session: false }),
  getWalletFromEmail(),
  getWalletSigner('skills'),
  catchAsync(async (req, res, next) => {
    const options = pick(req.body, ['email', 'credential_id'])
    const transactionHash = await skillService.mint({ ...options, user: req.user })
    res.locals = { transaction: transactionHash }
    next()
  }),
)

export default router
