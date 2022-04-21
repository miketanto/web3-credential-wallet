import Joi from 'joi'

import { addressFilter } from './helper'

export const get = {
  query: {
    id: Joi.number().optional(),
    owner: Joi.string().optional().custom(addressFilter),
    collectionId: Joi.number().optional(),
  },
}

export const list = {
  query: {
    id: Joi.number().required(),
  },
  body: {
    useGco: Joi.bool().required(),
    price: Joi.number().required(),
  },
}

export const buy = {
  query: {
    id: Joi.number().required(),
  },
}

export const deleter = {
  query: {
    id: Joi.number().required(),
  },
}

export const create = {
  body: {
    name: Joi.string().required(),
    path: Joi.string().required(),
    // need to be image_url in database
    collection_id: Joi.number().required(),
    creator: Joi.string().required().custom(addressFilter),
    nftContract: Joi.string().required().custom(addressFilter),
    royalty: Joi.string().required(),
    useGco: Joi.bool().required(),
    // currentOwner set in the service,
    listed: Joi.bool().default(false),
    tokenId: Joi.number().required(),
    quantity: Joi.number().required(),
    likes: Joi.number().default(0),
    price: Joi.number().default(0),
  },
  headers: {
    token: Joi.string().required(),
  },
}

export const updater = {
  body: {
    market_id: Joi.number().optional(), // Might have to make some params invalid so that it doesn't change the system
    name: Joi.string().optional(),
    image_url: Joi.string().optional(),
    symbol: Joi.string().optional(),
    asset_contract: Joi.string().optional().custom(addressFilter),
    collection_id: Joi.number().optional(),
    quantity: Joi.number().optional(),
    token_id: Joi.number().optional(),
    likes: Joi.number().optional(),
  },
}
