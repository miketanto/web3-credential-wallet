import httpStatus from 'http-status'
import { providers, utils } from 'ethers'

import { provider } from '../constants'
import { Skills, Wallets } from '../models'
import { connectContractWithSigner, getAddressOfWallet, ApiError } from '../utils'
import HHContract from '../contracts/hardhat_contracts.json'

const {
  address: MUMBAI_SKILLS_ADDRESS,
  abi: MUMBAI_SKILLS_ABI,
} = HHContract['80001'].mumbai.contracts.SkillsWallet

// const provider = new providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com')

export async function listAll() {
  try {
    return Skills.findAll({
      attributes: [['token_id', 'tokenId'], 'name', 'description', 'submitter', ['tx_hash', 'txHash'], 'status'],
      raw: true,
    })
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function create(options) {
  try {
    const { user: { email, signer }, description, name } = options

    const contract = connectContractWithSigner(signer, MUMBAI_SKILLS_ADDRESS, MUMBAI_SKILLS_ABI)

    const nonce = await signer.getTransactionCount()
    const curGasPrice = await signer.getGasPrice()
    console.log({
      nonce, curGasPrice: curGasPrice.toString(),
    })

    // pre-check if wallet's address has right privilege
    // << this makes API wait for next block (assuming enough gas), which is BAD
    // << thus, just make the contract handle the isCredentialer
    // const txPreCheck = await contract.isCredentialer(fromAddress)

    // TODO: Implement pre-check mechanism that uses local DB synced to public data
    // Since calling createCredential (might) exhaust gas fee even if it fails/reverts,
    // malicious user can keep calling the function. To prevent that, set a local DB entry
    // set syncs to credentials list of the contract (listen to block height) and do a
    // quick check against that data (e.g. array.includes(credentialer))

    // const lastTokenId = await contract.tokenId()
    // console.log(lastTokenId.toString())

    // NOTE: Must define gasPrice and gasLimit to mitigate
    // error `cannot estimate gas; transaction may fail or may require manual gas limit`
    // refer to https://ethereum.stackexchange.com/questions/99242/ethers-gaslimit-gasprice

    // NOTE: Set gas price to current gas price * 1.05 (for faster process)
    // NOTE: We must set nonce manually to prevent transaction getting stuck (look into using NonceManager)
    const config = {
      // gasPrice: curGasPrice.mul(1.05).toString(), // sometimes throws numerical underflow?
      gasPrice: curGasPrice,
      gasLimit: 100000, // 21000 should suffice, but just in case
      nonce,
    }
    const txReceipt = await contract.createCredential(config)
    const { hash: txHash } = txReceipt
    // console.log(txReceipt)

    // Add to database
    await Skills.create({
      name,
      description,
      submitter: email,
      tx_hash: txHash,
      status: 'pending',
    })

    return txReceipt.hash
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

// TODO: Skill expiry for each mint
export async function mint(options) {
  try {
    const { user: { signer }, email: toEmail, credential_id: credentialId } = options

    // to address validation
    const receiverRecords = await Wallets.findAll({
      where: { email: toEmail },
      raw: true,
    })
    if (!receiverRecords || receiverRecords.length === 0) {
      // no receiver exists
      throw new ApiError(401, `Wallet for user ${toEmail} not found`)
    }

    // from wallet exists
    const contract = connectContractWithSigner(signer, MUMBAI_SKILLS_ADDRESS, MUMBAI_SKILLS_ABI)

    // to wallet exists
    const receiverWalletData = receiverRecords[0]
    const receiverWallet = utils.HDNode.fromMnemonic(receiverWalletData.seed_phrase)
    const toAddress = getAddressOfWallet(receiverWallet)[0]

    const nonce = await signer.getTransactionCount()
    const curGasPrice = await signer.getGasPrice()
    console.log({
      nonce, curGasPrice: curGasPrice.toString(),
    })

    // const estimateGasPrice = await signer.estimateGas.issueCredential(toAddress, credentialId)
    // console.log(estimateGasPrice)

    // pre-check if wallet's address has right privilege
    // << this makes API wait for next block (assuming enough gas), which is BAD
    // << thus, just make the contract handle the isCredentialer
    // const txPreCheck = await contract.isCredentialer(fromAddress)

    // TODO: Implement pre-check mechanism that uses local DB synced to public data
    // Since calling createCredential (might) exhaust gas fee even if it fails/reverts,
    // malicious user can keep calling the function. To prevent that, set a local DB entry
    // set syncs to credentials list of the contract (listen to block height) and do a
    // quick check against that data (e.g. array.includes(credentialer))

    // TODO: Solve `error: Error: nonce too low`
    // This happens when credentialer submits `mint` request multiple times in a short time span

    // NOTE: Must define gasPrice and gasLimit to mitigate
    // error `cannot estimate gas; transaction may fail or may require manual gas limit`
    // refer to https://ethereum.stackexchange.com/questions/99242/ethers-gaslimit-gasprice
    const config = {
      // gasPrice: curGasPrice.mul(1.05).toString(), // sometimes throws numerical underflow?
      gasPrice: curGasPrice,
      gasLimit: 100000, // 21000 should suffice, but just in case
      nonce,
    }
    const txReceipt = await contract.issueCredential(toAddress, credentialId, config)
    const { hash: txHash } = txReceipt

    return txHash
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}
