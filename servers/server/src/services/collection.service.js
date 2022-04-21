import httpStatus from 'http-status'

import { Collections } from '../models'
import { ApiError } from '../utils'

export async function get(options) {
  try {
    const { id } = options
    // select one id
    if (id) return Collections.findOne({ where: { collection_id: id } })
    // return all if no id provided
    return Collections.findAll()
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function create(options) {
  try {
    return Collections.create(options)
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function deleter(options) {
  try {
    const { id } = options
    return Collections.destroy({ where: { collection_id: id } })
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function update(options, collection) {
  try {
    return Collections.update(
      { ...collection },
      {
        where: { collection_id: options.id },
      },
    )
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}
