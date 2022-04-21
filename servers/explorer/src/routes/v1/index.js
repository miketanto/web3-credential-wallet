import express from 'express'

import blockRoute from './block.route'
import transactionRoute from './transaction.route'
import authRoute from './auth.route'
import addressRoute from './address.route'
import finalResponder from '../../middlewares/finalResponder'

const router = express.Router()

const defaultRoutes = [
  {
    path: '/block',
    route: blockRoute,
  },
  {
    path: '/tx',
    route: transactionRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/address',
    route: addressRoute,
  },
]

defaultRoutes.forEach((route) => router.use(route.path, route.route))

// API route catch-all final responder
// Skips if invalid route
router.use(finalResponder)

export default router
