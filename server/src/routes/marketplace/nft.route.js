import express from 'express'
import passport from 'passport'

import { getWalletFromEmail, getWalletSigner, validate } from '../../middlewares'
import { nftService } from '../../services'
import { catchAsync, pick } from '../../utils'
import { nftValidation } from '../../validations'

const router = express.Router()

router.get(
  '/get',
  validate(nftValidation.get),
  catchAsync(async (req, res, next) => {
    const options = pick(req.query, ['id', 'collectionId', 'owner'])
    const NFTs = await nftService.get({ ...options })
    res.locals = { nfts: NFTs }
    next()
  }),
)

router.post(
  '/create',
  validate(nftValidation.create),
  passport.authenticate('bearer', { session: false }),
  getWalletFromEmail(),
  getWalletSigner('nft'),
  catchAsync(async (req, res, next) => {
    const options = { ...req.body, user: req.user }
    const receipt = await nftService.create(options)
    res.locals = { receipt }
    next()
  }),
)

router.post(
  '/update',
  validate(nftValidation.update),
  catchAsync(async (req, res, next) => {
    const options = pick(req.query, ['id'])
    const updateOptions = req.body
    res.locals = await nftService.update(options, updateOptions)
    next()
  }),
)

router.post(
  '/list',
  validate(nftValidation.list),
  passport.authenticate('bearer', { session: false }),
  getWalletFromEmail(),
  getWalletSigner('nft'),
  catchAsync(async (req, res, next) => {
    const options = pick(req.query, ['id'])
    const listOptions = req.body
    res.locals = await nftService.list({ ...options, user: req.user }, listOptions)
    next()
  }),
)

router.post(
  '/buy',
  validate(nftValidation.buy),
  passport.authenticate('bearer', { session: false }),
  getWalletFromEmail(),
  getWalletSigner('nft'),
  catchAsync(async (req, res, next) => {
    const options = pick(req.query, ['id'])
    res.locals = await nftService.buy({ ...options, user: req.user })
    next()
  }),
)

router.delete(
  '/delete',
  validate(nftValidation.delete),
  catchAsync(async (req, res, next) => {
    const options = pick(req.query, ['id'])
    const deleted = await nftService.deleter(options)
    res.locals = { deleted }
    next()
  }),
)

export default router
