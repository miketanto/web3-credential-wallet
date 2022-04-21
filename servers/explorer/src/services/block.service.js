import BigNumber from 'bignumber.js'
import { providers } from 'ethers'
import httpStatus from 'http-status'

import { Blocks, Transactions } from '../models/indexer'
import { ApiError, validateHash } from '../utils'
import { NETWORK, WEB3_URL } from '../utils/constants'

const provider = new providers.JsonRpcProvider(WEB3_URL, NETWORK)

/**
 * List the latest N blocks on pagination
 * @param options
 * @returns {Promise<*|*>}
 */
export async function list(options) {
  try {
    const {
      last, per_page: perPage, page, include_details: includeDetails,
    } = options

    if (last) return provider.getBlock('latest')

    const queryParams = {
      limit: perPage,
      offset: Math.max(0, (page - 1) * perPage),
      order: [['timestamp', 'DESC'], ['nonce', 'DESC']],
      // DON'T DO raw: true HERE, as it tampers with retrievals of data related to foreign key
    }

    // If includeDetails = true, then include related details of transactions (by foreign key).
    // Otherwise, just give an array of tx hashes (for each block).
    if (includeDetails) {
      queryParams.include = [Transactions]
    } else {
      queryParams.include = [{ model: Transactions, attributes: ['hash'] }]
    }

    // Convert block.Transactions to block.transaction (alias gives `Transactions` with uppercase)
    // Changing alias in `include` throws error since we initialized the table as `Transactions` in sequelize
    const blockList = await Blocks.findAll(queryParams)
    blockList.forEach((block) => {
      /* eslint-disable no-param-reassign */
      block.dataValues.transactions = block.dataValues.Transactions
      delete block.dataValues.Transactions
      /* eslint-enable no-param-reassign */
    })
    return blockList
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

/**
 * Get a block matching the given block number/hash
 * @param options
 * @returns {Promise<*|*>}
 */
export async function get(options) {
  try {
    const { key } = options

    const keyName = validateHash(key) ? 'hash' : 'number'
    const block = await Blocks.findOne({
      where: { [keyName]: key },
      include: [Transactions],
    })

    // Rename key
    block.dataValues.transactions = block.dataValues.Transactions
    delete block.dataValues.Transactions

    return block
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

/**
 * Get blocks matching the given options
 * @param options
 * @returns {Promise<*|*>}
 */
export async function getBy(options) {
  try {
    const {
      address, miner, per_page: perPage, page,
    } = options

    // <=== Get blocks matching a miner address ===>
    if (miner) {
      return Blocks.findAll({
        where: { miner },
        limit: perPage,
        offset: Math.max(0, (page - 1) * perPage),
        order: [['timestamp', 'DESC'], ['nonce', 'DESC']],
      })
    }

    // <=== Get blocks with transactions involving a given address ===>
    // (1) Get all transactions related to the address (with foreign key Blocks)
    const txsTo = await Transactions.findAll({
      where: { to: address },
      include: [Blocks],
      raw: true,
    })

    const txsFrom = await Transactions.findAll({
      where: { from: address },
      include: [Blocks],
      raw: true,
    })

    // (2) Gather all the associated blocks from the found txs
    const blocks = [
      ...txsTo.map((tx) => tx.Blocks),
      ...txsFrom.map((tx) => tx.Blocks),
    ]

    // (3) Remove duplicates (using Set) and return as array
    return [...new Set(blocks.map((block) => block.number))]
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

/**
 * Get average block time (latestBlock.time - (block 500 ago).time / 500.0)
 * @returns {Promise<Number>}
 */
export async function averageTime() {
  try {
    const blocksToConsider = 500
    const blockHeight = provider.getBlockNumber()

    // use the height found above to make sure height doesn't move while retrieving
    const lastBlock = await provider.getBlock(blockHeight)
    const oldBlock = await provider.getBlock(blockHeight - blocksToConsider)

    return parseFloat(new BigNumber(lastBlock.timestamp - oldBlock.timestamp).dividedBy(blocksToConsider).toFixed(1))
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

/**
 * Get last block number/height
 * @returns {Promise<Number>}
 */
export async function height() {
  try {
    return provider.getBlockNumber()
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}
