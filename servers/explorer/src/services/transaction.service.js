import httpStatus from 'http-status'
import sequelize from 'sequelize'

import { Blocks, Transactions } from '../models/indexer'
import { ApiError } from '../utils'

/**
 * List the latest N transactions on pagination
 * @param {object} options
 * @returns {Promise<*|*>}
 */
export async function list(options) {
  try {
    const {
      per_page: perPage, page,
    } = options

    return Transactions.findAll({
      limit: perPage,
      offset: Math.max(0, (page - 1) * perPage),
      order: [['block', 'DESC'], ['txIndex', 'DESC']],
    })
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

/**
 * Get a transaction matching the given transaction hash
 * @param options
 * @returns {Promise<*|*>}
 */
export async function get(options) {
  try {
    const { key: hash } = options
    return Transactions.findOne({
      where: { hash },
      include: [{ model: Blocks, as: 'blockTx' }], // returns as tx.blockTx
    })
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

// export async function pending() {
//   try {
//     return Transaction.getPending()
//   } catch (e) {
//     console.log(e)
//     if (e instanceof ApiError) throw e
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
//   }
// }

export async function getByAddress(options) {
  try {
    const { address, per_page: perPage, page } = options

    const queryParams = {
      limit: perPage,
      offset: Math.max(0, (page - 1) * perPage),
      raw: true, // returns just the data, not the model instance
      where: {
        [sequelize.Op.or]: [
          { from: address },
          { to: address },
        ],
      },
      order: [['block', 'DESC'], ['txIndex', 'DESC']],
    }

    const txs = await Transactions.findAll(queryParams)
    const fromHashes = []
    const toHashes = []

    // Divide from and to hashes
    if (Array.isArray(txs)) {
      txs.forEach((tx) => (tx.from === address ? fromHashes.push(tx.hash) : toHashes.push(tx.hash)))
    }

    return {
      transactions: txs,
      from: fromHashes,
      to: toHashes,
    }
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function last24hr() {
  try {
    const queryParams = {
      attributes: [
        [sequelize.cast(sequelize.fn('COUNT', sequelize.col('hash')), 'int'), 'txCount'],
        // [sequelize.fn('AVG', sequelize.col('gasUsed')), 'gasUsedAvg'],
        // [sequelize.fn('MIN', sequelize.col('gasUsed')), 'gasUsedMIN'],
        // [sequelize.fn('MAX', sequelize.col('gasUsed')), 'gasUsedMAX'],
        [sequelize.fn('AVG', sequelize.col('value')), 'valueAvg'],
        [sequelize.fn('MIN', sequelize.col('value')), 'valueMIN'],
        [sequelize.fn('MAX', sequelize.col('value')), 'valueMAX'],
      ],
      // where: {
      //   timestamp: {
      //     // last 24 hours
      //     [sequelize.Op.gt]: sequelize.literal("NOW() - INTERVAL '24 HOURS'"),
      //   },
      // },
      raw: true,
    }

    return Transactions.findAll(queryParams)
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

/**
 * Count all transactions
 * @return {Promise<Model<TModelAttributes, TCreationAttributes>[]>}
 */
export async function getTxCountAll() {
  try {
    return Transactions.count()
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}
