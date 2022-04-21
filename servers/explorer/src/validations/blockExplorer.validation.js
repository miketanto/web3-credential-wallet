import Joi from 'joi'

export const list = {
  query: {
    last: Joi.boolean().default(false),
    page: Joi.number().integer().min(1).default(1),
    per_page: Joi.number().integer().min(1).max(100)
      .default(10),
    // ==== BLOCK specific ====
    // If true, the returned block will contain all transactions as objects;
    // otherwise, only contains the transaction hashes
    include_details: Joi.boolean().default(false),
  },
}

export const get = {
  query: {
    // TODO: either string or number
    key: Joi.string().required(),
  },
}

export const getBy = {
  // xor -- only one key is accepted (and required)
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    per_page: Joi.number().integer().min(1).max(100)
      .default(10),
    address: Joi.string(),
    miner: Joi.string(),
  }).xor('address', 'miner'),
}
