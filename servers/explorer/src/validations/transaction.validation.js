import Joi from 'joi'

// eslint-disable-next-line import/prefer-default-export
export const getByAddress = {
  query: {
    address: Joi.string().required(),
    page: Joi.number().integer().min(1).default(1),
    per_page: Joi.number().integer().min(1).max(100)
      .default(10),
  },
}
