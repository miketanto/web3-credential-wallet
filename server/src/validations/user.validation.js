import Joi from 'joi'

import { addressFilter } from './helper'

export const search = {
  query: {
    email: Joi.string().email({ tlds: { allow: ['edu'] } }).required(),
  },
}

export const associated = {
  query: {
    net_id: Joi.string().required(),
  },
}

export const needAddress = {
  query: {
    address: Joi.string().required().custom(addressFilter),
  },
}

export const needAddressPost = {
  body: {
    address: Joi.string().required().custom(addressFilter),
  },
}
