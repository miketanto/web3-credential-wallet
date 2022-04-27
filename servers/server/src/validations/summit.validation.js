import Joi from 'joi'

import { addressFilter } from './helper'

export const associate = {
  body: {
    address: Joi.string().required().custom(addressFilter),
  },
}
