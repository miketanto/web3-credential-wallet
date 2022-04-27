import express from 'express'

import collectionRoute from './marketplace/collection.route'
import nftRoute from './marketplace/nft.route'
import skillRoute from './skill/skill.route'
import summitRoute from './summit/summit.route'
import userRoute from './user/user.route'
import finalResponder from '../middlewares/finalResponder'

const router = express.Router()

const defaultRoutes = [
  {
    path: '/skill',
    route: skillRoute,
  },
  {
    path: '/summit',
    route: summitRoute,
  },
  {
    path: '/user',
    route: userRoute,
  },
  // {
  //   path: '/profile',
  //   route: profileRoute,
  // },
  {
    path: '/collection',
    route: collectionRoute,
  },
  {
    path: '/nft',
    route: nftRoute,
  },
]

defaultRoutes.forEach((route) => router.use(route.path, route.route))

// API route catch-all final responder
// Skips if invalid route
router.use(finalResponder)

export default router
