import comPkg from '@ethereumjs/common'
import txPkg from '@ethereumjs/tx'
import { CronJob } from 'cron'
import dotenv from 'dotenv'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import Web3 from 'web3'

// Since @ethereumjs/... is CommonJS, we need to do this to get named import
const Common = comPkg.default
const { Transaction } = txPkg

// eslint-disable-next-line import/order
import { IS_PRODUCTION } from './utils/constants'

const __dirname = dirname(fileURLToPath(import.meta.url))
// This config must come before all other imports that rely on process.env
//  and any variables that use process.env (other than IS_PRODUCTION)
dotenv.config({ path: path.join(__dirname, '../.env.crontx') })

import logger from './utils/logger'

logger.defaultMeta.service = IS_PRODUCTION ? 'cron-tx' : 'cron-tx-dev'

const commonChain = Common.custom({
  chainId: 1515,
  name: 'iBlock',
})

const CHAIN_URL = IS_PRODUCTION ? 'https://chain.iblockcore.com' : 'https://devchain.iblockcore.com'

const web3 = new Web3(CHAIN_URL)

const receivers = [
  '0x7B1C233eD3aeE2dda0B6D41A441603036753B99b',
  '0xE597921597223b7c4B1163CFc38af28d4616106B',
  '0xFbC8C0082Fe72c0CF1c1cE746EF09a2db495c106',
  '0x1341052654f9DD0df405165232919ebCc022B397',
  '0xF2018FF01B1DA7c2ecf464c98bA369FE394A3FeB',
  '0x26903925FdF2FaED423afdbB97164E5492e7FbdB',
  '0x448fd65562b816BedC81D8c15B45A48407F8e845',
]

async function sendSignedTransaction(addressFrom, addressTo, privateKey) {
  // transaction count, including the pending ones
  const txCount = await web3.eth.getTransactionCount(addressFrom, 'pending')
  const txParams = {
    nonce: web3.utils.toHex(txCount),
    to: addressTo,
    from: addressFrom,
    value: web3.utils.toHex(web3.utils.toWei('0.1', 'ether')),
    gasLimit: 100000,
  }

  const tx = Transaction.fromTxData(txParams, { common: commonChain })
  const signedTx = tx.sign(privateKey)
  const serializedTx = signedTx.serialize()
  const raw = `0x${serializedTx.toString('hex')}`

  return web3.eth.sendSignedTransaction(raw)
}

const SENDER_ADDRESS = IS_PRODUCTION ? process.env.CRONTX_SENDER_ADDRESS : process.env.CRONTX_DEV_SENDER_ADDRESS
const SENDER_PASSPHRASE = IS_PRODUCTION ? process.env.CRONTX_SENDER_PASS : process.env.CRONTX_DEV_SENDER_PASS
let SENDER_PRIVATE_KEY = IS_PRODUCTION ? process.env.CRONTX_SENDER_PRIVATE : process.env.CRONTX_DEV_SENDER_PRIVATE
SENDER_PRIVATE_KEY = Buffer.from(SENDER_PRIVATE_KEY.substring(2), 'hex') // remove '0x' & make it 32 bytes

const job = new CronJob('*/6 * * * * *', async () => {
  // NOTE: scheduled script every 10s
  const randIdx = Math.floor(Math.random() * receivers.length)
  const addressTo = receivers[randIdx]

  if (!SENDER_ADDRESS || !addressTo) return

  // Send Transaction
  logger.info(`Sending to ${addressTo}`)
  // console.log(`Sending to ${addressTo}`)
  await web3.eth.personal.unlockAccount(SENDER_ADDRESS, SENDER_PASSPHRASE, 600)
    .then(() => sendSignedTransaction(SENDER_ADDRESS, addressTo, SENDER_PRIVATE_KEY))
    .catch((error) => {
    // console.log('======== ERROR ========')
      console.log(error)
    })
}, null, true)
job.start()
