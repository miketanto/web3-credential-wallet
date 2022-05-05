import httpStatus from 'http-status'
import { Contract, Wallet } from 'ethers'
import { Sequelize } from 'sequelize'

import { envVars } from '../config'
import { provider } from '../constants'
// import HHContract from '../contracts/summit/hardhat_contracts.json'
// TODO: dev should switch to `mumbai`, prod use `polygon`
import HHContract from '../contracts/summit/polygon/hardhat_contracts.json'
import { SummitAddresses } from '../models'
import { ApiError } from '../utils'

const { Op } = Sequelize

// TODO: dev should switch to `mumbai`, prod use `polygon`
const {
  address: SUMMIT_NFT_ADDRESS,
  abi: SUMMIT_NFT_ABI,
} = HHContract['137'].polygon.contracts.UIUCBlockchainSummit2022

async function safeMintToAddress(address) {
  // TODO: dev should switch to `mumbai`, prod use `polygon`
  const signer = new Wallet(envVars.privateKeys.polygon, provider)
  const contract = new Contract(SUMMIT_NFT_ADDRESS, SUMMIT_NFT_ABI, signer)
  const config = {
    gasPrice: await signer.getGasPrice(),
    gasLimit: 100000, // 21000 should suffice, but just in case
    nonce: await signer.getTransactionCount(),
  }
  return contract.safeMint(address, config)
}

async function checkMintAlreadyDone(address) {
  // TODO: dev should switch to `mumbai`, prod use `polygon`
  const signer = new Wallet(envVars.privateKeys.polygon, provider)
  const contract = new Contract(SUMMIT_NFT_ADDRESS, SUMMIT_NFT_ABI, signer)
  const config = {
    gasPrice: await signer.getGasPrice(),
    gasLimit: 100000, // 21000 should suffice, but just in case
    nonce: await signer.getTransactionCount(),
  }
  const balance = await contract.balanceOf(address, config)
  return balance.toString() !== '0' // returns true if user already has one
}

export async function getAssociated(options) {
  try {
    const { user: { email } } = options

    const associatedRecord = await SummitAddresses.findOne({
      where: { email },
      raw: true,
    })
    return !associatedRecord ? '' : associatedRecord.address
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function associate(options) {
  try {
    const { user: { email }, address } = options

    // Find all entries by matching either email or address
    // If any match, then abort creation
    const records = await SummitAddresses.findAll({
      where: {
        [Op.or]: { email, address },
      },
      raw: true,
    })

    if (records && records.length > 0) {
      return 'exists'
    }

    await SummitAddresses.create({
      email,
      address,
    })
    return 'associated'
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function custodial(options) {
  try {
    // custodial retrieve user signer's address, populated by middlewares
    const { user: { address } } = options
    return address
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function mint(options) {
  try {
    const { user: { email } } = options

    const userRecord = await SummitAddresses.findOne({
      where: { email },
      raw: true,
    })
    if (!userRecord) {
      // no receiver exists
      throw new ApiError(401, `User ${email} not found`)
    }

    const { address } = userRecord

    const isAlreadyMinted = await checkMintAlreadyDone(address)
    if (isAlreadyMinted) {
      return 'already-minted'
    }

    const txReceipt = await safeMintToAddress(address)
    console.log(txReceipt)
    const { hash: txHash } = txReceipt
    return txHash
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}
