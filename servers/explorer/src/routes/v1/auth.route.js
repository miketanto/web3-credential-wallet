import express from 'express'

import { auth } from '../../middlewares'
import { catchAsync } from '../../utils'

const { aadAuth, regenerateSessionAfterAuthentication } = auth

const router = express.Router()

// POST /auth/openid/return
//   Use passport.authenticate() as route middleware to authenticate the request.
//   If authentication fails, the request will be routed to 404 response.
//   Otherwise, the primary route function function will be called, which, in this example,
//   will send the request to the next middleware
router.post('/openid/return', aadAuth, regenerateSessionAfterAuthentication, catchAsync(async (req, res, next) => {
  next()
}))

// 'logout' route, logout from passport, and destroy the session with AAD.
router.get('/logout', aadAuth, catchAsync(async (req, res, next) => {
  req.session.destroy(() => {
    req.logOut()
    // res.redirect(envVars.aad.destroySessionUrl)
    // res.redirect('/')
    next()
  })
}))

export default router
