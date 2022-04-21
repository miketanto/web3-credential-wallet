import { CHAIN_NATIVE_DECIMALS } from './constants'

export default async function getTransactionData(provider, txHash) {
  const tx = await provider.getTransaction(txHash)
  if (!tx) return null

  const receipt = await provider.getTransactionReceipt(txHash)
  if (!receipt) return null

  // Note that BigNumber provided by `ethers` is different. Consult documentation for methods:
  // https://docs.ethers.io/v5/api/utils/bignumber/#BigNumber--methods

  // Read more about types:
  // https://docs.ethers.io/v5/api/providers/types/#providers-TransactionResponse
  // inherits https://docs.ethers.io/v5/api/utils/transactions/#Transaction
  const data = {
    block: tx.blockNumber,
    blockHash: tx.blockHash,
    chainId: tx.chainId,
    contractAddress: receipt.contractAddress,
    cumulativeGasUsed: receipt.cumulativeGasUsed.toBigInt(), // BigNumber
    data: tx.data,
    effectiveGasPrice: receipt.effectiveGasPrice.toBigInt(), // BigNumber
    from: tx.from,
    gasLimit: tx.gasLimit.toBigInt(), // BigNumber
    gasPrice: tx.gasPrice.toBigInt(), // BigNumber
    hash: tx.hash,
    initTransaction: false,
    nonce: tx.nonce,
    status: receipt.status,
    to: tx.to, // This is null if the transaction was an init transaction, used to deploy a contract.
    txIndex: tx.transactionIndex || 0, // init tx & some other txs return `null`, then use 0
    value: tx.value.div(CHAIN_NATIVE_DECIMALS).toBigInt(), // BigNumber with at least 18 digits (Ether has 18 decimals)
  }

  if (!tx.to || typeof tx.to === 'undefined') {
    // Part of receipt data
    // "If this transaction has a null to address, it is an init transaction used to deploy
    // a contract, in which case `receipt.contractAddress` is the address created by that contract."
    data.to = receipt.contractAddress
    data.initTransaction = true // is init tx
  }

  // if (data.input.startsWith('0xa9059cbb')) {
  //   // is a contract transfer
  //   data.contractAddress = receipt.contractAddress
  //   data.contractTo = data.input.slice(10, data.input.length - 64)
  //   data.contractValue = data.input.slice(74)
  // }
  //
  // // Correct contract transfer transaction represents '0x' + 4 bytes 'a9059cbb' + 32 bytes (64 chars) for contract address and 32 bytes for its value
  // // Some buggy txs can break up Indexer, so we'll filter it
  // if (data.contractTo && data.contractTo.length > 128) {
  //   data.contractAddress = null
  //   data.contractTo = null
  //   data.contractValue = null
  // }

  return data
}
