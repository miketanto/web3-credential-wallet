// Reference: https://github.com/AzureADQuickStarts/AppModelv2-WebApp-OpenIDConnect-nodejs/blob/master/app.js
import jwt from 'jsonwebtoken'
import passport from 'passport'
import BearerStrategy from 'passport-http-bearer'

import envVars from './envVars'
import sequelize from '../models/db'

// sequelize.sync({ alter: true })

if (envVars.env === 'db_reset') {
  sequelize.sync({ force: true })
}

const { Users } = sequelize.models

const OIDCParams = {
  identityMetadata: envVars.aad.identityMetadata,
  clientID: envVars.aad.clientID,
  responseType: envVars.aad.responseType,
  responseMode: envVars.aad.responseMode,
  redirectUrl: envVars.aad.redirectUrl,
  allowHttpForRedirectUrl: envVars.aad.allowHttpForRedirectUrl,
  clientSecret: envVars.aad.clientSecret,
  validateIssuer: envVars.aad.validateIssuer,
  issuer: envVars.aad.issuer,
  passReqToCallback: envVars.aad.passReqToCallback,
  scope: envVars.aad.scope,
}

function findByOid(oid, fn) {
  Users.findOne({
    where: { oid },
    raw: true,
  }).then((res) => {
    if (res) fn(null, res)
    else fn(null, null)
  }).catch((err) => fn(err, null))
}

// use as 'bearer'
const bearerStrategy = new BearerStrategy(OIDCParams, ((token, done) => {
  const decoded = jwt.decode(token)
  findByOid(decoded.oid, (err, user) => {
    if (err) return done(err)

    if (user) return done(null, user)

    // Auto-registration
    console.log('Auto register')
    return Users.create({
      email: decoded.unique_name,
      oid: decoded.oid,
      net_id: decoded.unique_name.split('@')[0],
      first_name: decoded.given_name,
      last_name: decoded.family_name,
    }).then((newUserRecord) => done(null, newUserRecord.dataValues))
  })
}))

export function initialize() {
  // To support persistent login sessions, Passport needs to be able to serialize users into and deserialize
  // users out of the session. Typically, this will be as simple as storing the user ID when serializing, and
  // finding the user by ID when deserializing.
  passport.serializeUser((user, done) => done(null, user.oid))
  passport.deserializeUser((oid, done) => findByOid(oid, (err, user) => done(err, user)))

  //-----------------------------------------------------------------------------
  // Use the OIDCStrategy within Passport.
  //
  // Strategies in passport require a `verify` function, which accepts credentials
  // (in this case, the `oid` claim in id_token), and invoke a callback to find
  // the corresponding user object.
  //
  // The following are the accepted prototypes for the `verify` function
  // (1) function(iss, sub, done)
  // (2) function(iss, sub, profile, done)
  // (3) function(iss, sub, profile, access_token, refresh_token, done)
  // (4) function(iss, sub, profile, access_token, refresh_token, params, done)
  // (5) function(iss, sub, profile, jwtClaims, access_token, refresh_token, params, done)
  // (6) prototype (1)-(5) with an additional `req` parameter as the first parameter
  //
  // To do prototype (6), passReqToCallback must be set to true in the config.
  //-----------------------------------------------------------------------------
  passport.use(bearerStrategy)

  return passport
}

export function regenerateSessionAfterAuthentication(req, res, next) {
  const passportInstance = req.session.passport
  return req.session.regenerate((err) => {
    if (err) return next(err)
    req.session.passport = passportInstance
    return req.session.save(next)
  })
}
