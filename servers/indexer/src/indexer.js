import Promise from 'bluebird'
import { providers } from 'ethers'
import ms from 'ms'
// import util from 'util'

import sequelize, { Blocks, Transactions } from './models'
import {
  LOG_INTERVAL, NETWORK, QUEUE_TIMEOUT, WEB3_URL,
} from './utils/constants'
import getTransactionData from './utils/getTransactionData'
import logger from './utils/logger'

const { Block: BlockType } = providers

const provider = new providers.JsonRpcProvider(WEB3_URL, NETWORK)

let blocksToIndex = []
let indexedBlockAmount = 0

/**
 * Indexes a block and its transactions
 * @param {number} blockNumber
 * @return {BlockType|null, any[]}
 */
async function indexBlock(blockNumber) {
  let block = null
  let txs = {}
  try {
    block = await provider.getBlock(blockNumber)

    if (block && block.transactions && block.transactions.length) {
      // Line below produces { txHash1: txData1, txHash2: txData2, ... }
      const blockTxProms = Object.fromEntries(block.transactions.map((txHash) => [txHash, getTransactionData(provider, txHash)]))

      // DONT delete any null/rejected tx data. Return as-is.
      txs = await Promise.props(blockTxProms)
      // console.log(util.inspect(txs, false, null, true))
    }
  } catch (err) {
    // logger.error(err)
    console.log(err)
  }
  return [block, txs]
}

async function clearBlockQueue() {
  /* eslint-disable no-await-in-loop,no-continue,no-return-await */
  try {
    while (blocksToIndex.length) {
      const blockNumber = blocksToIndex.shift() // removes & gets first element
      const [block, txs] = await indexBlock(blockNumber)

      if (!block) continue

      // Prepare block data for indexing
      const indexedBlock = block
      indexedBlock.chainId = NETWORK.chainId // TODO: Make global variable - { chainId } = await provider.getNetwork()
      indexedBlock.timestamp = block.timestamp * 1000 // convert to ms
      delete indexedBlock.transactions // stored in Transactions table (with foreign key to block hash)

      // Post to Blocks db & increment block indexed data
      await Blocks.create(indexedBlock)
      indexedBlockAmount += 1

      // Post to Transactions db (only add Txs after we are able to post indexed block data)
      if (!Object.keys(txs).length) continue
      await Transactions.bulkCreate(Object.values(txs), { raw: true })

      // Log with interval
      if (indexedBlockAmount % LOG_INTERVAL === 0) {
        logger.info(`blocks_indexed: ${indexedBlockAmount}`)
        logger.info(`blocks_to_index: ${blocksToIndex.length}`)
      }
    }

    setTimeout(async () => await clearBlockQueue(), QUEUE_TIMEOUT)
  } catch (err) {
    logger.error('Clear Block Queue Error')
    console.log(err)
    // Sometimes blocksToIndex can contain duplicate block numbers.
    // In that case, just ignore it and call this function again.
    setTimeout(async () => await clearBlockQueue(), QUEUE_TIMEOUT)
  }
  /* eslint-enable no-await-in-loop,no-continue,no-return-await */
}

/**
 * Finds a list of missing block numbers between 1 and maxBlockNumber in the Blocks database
 * @param {number | null} maxBlockNumber
 * @return {Promise<number[]>}
 */
async function findMissingBlockNumbers(maxBlockNumber) {
  if (typeof maxBlockNumber !== 'number') {
    const lastIndexedHeight = await Blocks.max('number')
    // eslint-disable-next-line no-param-reassign
    maxBlockNumber = lastIndexedHeight ?? 1
  }

  // Execute the function (initialized in scripts/init.sql) to return missing number blocks in 1...maxBlockNumber (inclusive)
  const searchQuery = 'SELECT findMissingBlockNumbers(:maxBlockNumber) as number;' // find_missing_block_numbers -> number
  const blockNumbers = await sequelize.query(searchQuery, {
    replacements: { maxBlockNumber },
    raw: true,
    type: sequelize.QueryTypes.SELECT,
  })

  return Array.isArray(blockNumbers) ? blockNumbers.map((row) => row.number) : []
}
(async () => {
  // await sequelize.sync({ alter: true }) // alter or force: true => drops/resets the tables
  if (process.env.RESET_DB === 'true') await sequelize.sync({ force: true })
  else if (process.env.ALTER_DB === 'true') await sequelize.sync({ alter: true })
  else await sequelize.sync()

  await provider.ready

  const blockHeight = await provider.getBlockNumber() // last block number

  // Append new blocks to the queue
  provider.on('block', (blockNumber) => {
    // console.log('New block', blockNumber)
    blocksToIndex.push(blockNumber)
  })

  provider.on('error', (err) => {
    logger.error('Provider Event Emitter Error')
    console.log(err)
    provider.off('block')
    setTimeout(() => provider.on('block', blocksToIndex.push), ms('5 seconds'))
  })

  // Array of missing blocks (fetched before clearing queue begins)
  const missingBlockNumbers = await findMissingBlockNumbers(blockHeight)

  logger.info(`Latest block number is ${blockHeight}`)
  logger.info(`# of blocks to index: ${missingBlockNumbers.length}`)

  // missing blocks come first, then blocks to index (that gets pushed as provider listens to new blocks)
  blocksToIndex = [...missingBlockNumbers, ...blocksToIndex]

  // Graceful shutdown
  process.on('SIGINT', () => {
    try {
      provider.removeAllListeners()
      process.exit(0)
    } catch (err) {
      logger.error(err)
      process.exit(1)
    }
  })

  // Start clearing queue (index blocks)
  await clearBlockQueue()
})()
