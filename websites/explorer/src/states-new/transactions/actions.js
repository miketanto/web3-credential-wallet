import { createAction } from '@reduxjs/toolkit'
// import { TradeType } from '@uniswap/sdk-core'

// import { VoteOption } from '../governance/types'

/**
 * Be careful adding to this enum, always assign a unique value (typescript will not prevent duplicate values).
 * These values is persisted in state and if you change the value it will cause errors
 */
/**
 * Transaction type
 * @enum {number}
 */
export const TransactionType = {
  APPROVAL: 0,
  SWAP: 1,
  VOTE: 2,
  DELEGATE: 3,
  WRAP: 4,
  SUBMIT_PROPOSAL: 5,
}

/**
 * @interface SerializableTransactionReceipt
 * @property {string} to
 * @property {string} from
 * @property {string} contractAddress
 * @property {number} transactionIndex
 * @property {string} blockHash
 * @property {string} transactionHash
 * @property {number} blockNumber
 * @property {number} [status]
 *
 * @interface BaseTransactionInfo
 * @property {TransactionType} type
 *
 * @interface {BaseTransactionInfo} DelegateTransactionInfo
 * @property {TransactionType.DELEGATE} type
 * @property {string} delegatee
 *
 * @interface {BaseTransactionInfo} ApproveTransactionInfo
 * @property {TransactionType.APPROVAL} type
 * @property {string} tokenAddress
 * @property {string} spender
 *
 * @interface {BaseTransactionInfo} WrapTransactionInfo
 * @property {TransactionType.WRAP} type
 * @property {boolean} unwrapped
 * @property {string} currencyAmountRaw
 * @property {number} [chainId]
 *
 * @interface {BaseTransactionInfo} SubmitProposalTransactionInfo
 * @property {TransactionType.SUBMIT_PROPOSAL} type
 *
 * @interface {BaseTransactionInfo} BaseSwapTransactionInfo
 * @property {TransactionType.SWAP} type
 * @property {TradeType} tradeType
 * @property {string} inputCurrencyId
 * @property {string} outputCurrencyId
 */

// export interface VoteTransactionInfo extends BaseTransactionInfo {
//   type: TransactionType.VOTE
//   governorAddress: string
//   proposalId: number
//   decision: VoteOption
//   reason: string
// }

// <{
//   chainId: number
//   hash: string
//   from: string
//   info: TransactionInfo
// }>
export const addTransaction = createAction('transactions/addTransaction')
// <{ chainId: number }>
export const clearAllTransactions = createAction('transactions/clearAllTransactions')
// <{
//   chainId: number
//   hash: string
//   receipt: SerializableTransactionReceipt
// }>
export const finalizeTransaction = createAction('transactions/finalizeTransaction')
// <{
//   chainId: number
//   hash: string
//   blockNumber: number
// }>
export const checkedTransaction = createAction('transactions/checkedTransaction')
