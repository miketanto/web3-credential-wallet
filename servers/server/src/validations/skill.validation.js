import Joi from 'joi'

export const create = {
  body: {
    name: Joi.string().required(),
    description: Joi.string().required(),
  },
}

export const mint = {
  body: {
    email: Joi.string().required().email({ tlds: { allow: ['edu'] } }).required(), // receiver email
    credential_id: Joi.number().required(),
  },
}

export const addCredentialType = {
  body:{
    type: Joi.string().required()
  }
}