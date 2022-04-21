import express from 'express'

import validate from '../../middlewares/validate'
import { blockExplorerValidation } from '../../validations'
import { isArray, pick, catchAsync } from '../../utils'
import { blockService } from '../../services'

const router = express.Router()

router.get('/list', validate(blockExplorerValidation.list), catchAsync(async (req, res, next) => {
  const options = pick(req.query, ['last', 'per_page', 'page'])
  const blocks = await blockService.list(options)

  // READ (res.locals): https://stackoverflow.com/a/38355597
  res.locals = { blocks: isArray(blocks) ? blocks : [blocks] }
  if (blocks.length === 0) res.locals.msg = 'No blocks found'

  next()
}))

router.get('/get', validate(blockExplorerValidation.get), catchAsync(async (req, res, next) => {
  const options = pick(req.query, ['key'])
  const block = await blockService.get(options)

  res.locals = { block }
  if (block == null) res.locals.msg = 'No block found'

  next()
}))

router.get('/get-by', validate(blockExplorerValidation.getBy), catchAsync(async (req, res, next) => {
  const options = pick(req.query, ['address', 'miner', 'page', 'per_page'])
  options.blockSweepCount = 500 // search upto 500 blocks ago (incl. last block)
  const blocks = await blockService.getBy(options)

  res.locals = { blocks: isArray(blocks) ? blocks : [blocks] }
  if (blocks.length === 0) res.locals.msg = 'No blocks found'

  next()
}))

router.get('/average-time', catchAsync(async (req, res, next) => {
  res.locals = { averageBlockTime: await blockService.averageTime() }
  next()
}))

router.get('/height', catchAsync(async (req, res, next) => {
  res.locals = { height: await blockService.height() }
  next()
}))

export default router
