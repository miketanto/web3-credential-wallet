import Joi from 'joi'

import { addressFilter } from './helper'

export const get = {
  query: {
    collection_id: Joi.number().optional(),
  },
}

export const deleter = {
  query: {
    collection_id: Joi.number().required(),
  },
}

export const create = {
  body: {
    name: Joi.string().required(),
    creator: Joi.string().required().custom(addressFilter),
    contract_address: Joi.string().required().custom(addressFilter),
    description: Joi.string().required(),
    no_items: Joi.number().required(),
    no_owners: Joi.number().default(1),
    floor_price: Joi.number().default(0),
    volume_traded: Joi.number().default(0),
    website: Joi.string().default(null),
    discord: Joi.string().default(null),
    instagram: Joi.string().default(null),
    twitter: Joi.string().default(null),
  },
}

export const update = {
  body: {
    name: Joi.string().required(),
    contract_address: Joi.string().optional().custom(addressFilter),
    description: Joi.string().optional(),
    no_items: Joi.number().optional(),
    no_owners: Joi.number().optional(),
    floor_price: Joi.number().optional(),
    volume_traded: Joi.number().optional(),
    website: Joi.string().optional(),
    discord: Joi.string().optional(),
    instagram: Joi.string().optional(),
    twitter: Joi.string().optional(),
  },
  query: {
    collection_id: Joi.number().required(),
  },
}
