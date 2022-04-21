import { constants, utils } from 'ethers'
import Joi from 'joi'

function addressFilter(value, helper) {
  if (!utils.isAddress(value) || value === constants.AddressZero) return helper.message('Address must be valid and not be a zero address')
  return value
}

export const associate = {
  body: {
    address: Joi.string().required().custom(addressFilter),
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
