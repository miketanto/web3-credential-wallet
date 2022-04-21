import httpStatus from 'http-status'
import Web3 from 'web3'
import comPkg from '@ethereumjs/common'
import txPkg from '@ethereumjs/tx'
import Sequelize from 'sequelize'
// const BigNumber = require('bignumber.js')

import { Addresses, Replenishes } from '../models/db'
import { envVars } from '../config'
import { ApiError } from '../utils'

// Since @ethereumjs/... is CommonJS, we need to do this to get named import
const Common = comPkg.default
const { Transaction } = txPkg

const web3 = new Web3(envVars.web3NodeUrl)

const common = Common.custom({
  name: 'iBlock',
  chainId: 1515,
})

// /**
//  * Get list of addresses OR Create new address for a given user email
//  * @param options
//  * @returns {Promise<*|*>}
//  */
// const getOrCreate = async (options) => {
//   try {
//     const { user: { email } } = options
//
//     const queryParams = {
//       where: { email },
//       attributes: ['address'],
//       raw: true,
//     }
//
//     const addressRecords = await Addresses.findAll(queryParams)
//     const addresses = []
//
//     if (!addressRecords || addressRecords.length === 0) {
//       const { address, privateKey } = web3.eth.accounts.create()
//       const createParams = { email, address, privateKey }
//       await Addresses.create(createParams)
//       addresses.push({ address })
//     } else {
//       addressRecords.forEach((obj) => addresses.push(obj.address))
//     }
//
//     return addresses
//   } catch (e) {
//     console.log(e)
//     if (e instanceof ApiError) throw e
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
//   }
// }

export async function replenishFunction(addressFrom, accountPassword, addressTo, privateKey) {
  await web3.eth.personal.unlockAccount(addressFrom, accountPassword, 600)

  const txCount = await web3.eth.getTransactionCount(addressFrom, 'pending')
  const nonce = web3.utils.toHex(txCount)

  const txParams = {
    nonce,
    to: addressTo,
    from: addressFrom,
    value: web3.utils.toHex(web3.utils.toWei('1', 'ether')),
    gasLimit: 50000,
  }

  const tx = Transaction.fromTxData(txParams, { common })
  const signedTx = tx.sign(Buffer.from(privateKey, 'hex'))
  const serializedTx = signedTx.serialize()
  const raw = `0x${serializedTx.toString('hex')}`

  return web3.eth.sendSignedTransaction(raw)
}

export async function associate(options) {
  try {
    const { address, user: { email, netId } } = options
    const queryParams = {
      where: { email, net_id: netId },
      attributes: ['address'],
      raw: true,
    }
    const alreadyAssociated = await Addresses.findAll(queryParams)

    // Prevent re-associating if already associated
    if (alreadyAssociated.includes(address)) return false

    // For first time association, mint some Ether (for gas purposes)
    // TODO: This minting for gas should be replaced by meta-transactions (ERC712 & EIP2612)
    // NOTE: For above, consult more at https://github.com/wighawag/singleton-1776-meta-transaction
    if (!alreadyAssociated.length) {
      // Ignore error
      try {
        // envVars.replenish is the signer account with a lot of Ether
        await replenishFunction(envVars.replenish.address, envVars.replenish.password, address, envVars.replenish.privateKey)
      } catch (err) {
        console.log(err)
      }
    }

    return await Addresses.create({ email, net_id: netId, address })
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function getAssociated(options) {
  try {
    const { net_id: netId } = options

    const queryParams = {
      where: { net_id: netId },
      attributes: ['address'],
      raw: true,
    }

    // Return all addresses associated with the given NetID
    return await Addresses.findAll(queryParams)
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function getBalance(options) {
  try {
    const { address } = options
    return web3.eth.getBalance(address)
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function replenish(options) {
  try {
    const { address } = options

    const queryParams = {
      where: {
        address,
        updatedAt: {
          // records within last 24 hrs
          [Sequelize.Op.gte]: Sequelize.literal("NOW() - INTERVAL '24 HOURS'"),
        },
      },
      raw: true,
    }
    // should replenish if no record found
    const shoudReplenish = !(await Replenishes.findOne(queryParams))

    if (shoudReplenish) {
      // replenish will take time since it's waiting for miner to mine the tx
      replenishFunction(envVars.replenish.address, envVars.replenish.password, address, envVars.replenish.privateKey)
      // do cool time of 24 hr
      const record = await Replenishes.findOne({ where: { address } })
      if (!record) await Replenishes.create({ address })
      else await Replenishes.update({ updatedAt: Sequelize.literal('NOW()') }, { where: { address } })
    }

    const balance = await web3.eth.getBalance(address)
    return { balance, isReplenished: shoudReplenish }
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}
