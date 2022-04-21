import express from 'express'

import validate from '../../middlewares/validate'
import { blockService, transactionService } from '../../services'
import {
  pick, catchAsync, isArray, isObject,
} from '../../utils'
import { blockExplorerValidation, transactionValidation } from '../../validations'

const router = express.Router()

router.get('/list', validate(blockExplorerValidation.list), catchAsync(async (req, res, next) => {
  const options = pick(req.query, ['last', 'per_page', 'page'])
  options.include_details = true
  const transactions = await transactionService.list(options)

  // READ (res.locals): https://stackoverflow.com/a/38355597
  res.locals = { transactions }
  if (!isArray(transactions) || transactions.length === 0) res.locals.msg = 'No transactions found'

  next()
}))

router.get('/get', validate(blockExplorerValidation.get), catchAsync(async (req, res, next) => {
  const options = pick(req.query, ['key'])
  const transaction = await transactionService.get(options)

  res.locals = { transaction }
  if (transaction == null) res.locals.msg = 'No transactions found'

  next()
}))

router.get('/get-by-address', validate(transactionValidation.getByAddress), catchAsync(async (req, res, next) => {
  // TODO: `fromOnly` and `toOnly` boolean (mutually exclusive) that matches
  // address based on `from` xor `to` (default is both)
  const options = pick(req.query, ['address', 'per_page', 'page'])
  const transactions = await transactionService.getByAddress(options)

  res.locals = { transactions }
  if (!isObject(transactions) || !isArray(transactions.transactions) || !transactions.transactions.length) res.locals.msg = 'No transactions found'

  next()
}))

router.get('/last24hr', catchAsync(async (req, res, next) => {
  const stats = await transactionService.last24hr()

  if (!stats) res.locals.msg = 'No transactions found'
  if (stats[0]) res.locals = Object.assign(res.locals, stats[0])

  next()
}))

router.get('/count-all', catchAsync(async (req, res, next) => {
  res.locals = { count: await transactionService.getTxCountAll() }
  next()
}))

// router.get('/pending', catchAsync(async (req, res, next) => {
//   const transactions = await transactionService.pending()
//
//   res.locals = { transactions }
//   if (!isArray(transactions) || transactions.length === 0) res.locals.msg = 'No transactions found'
//
//   next()
// }))

export default router
