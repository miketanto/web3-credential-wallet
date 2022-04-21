import { providers } from 'ethers'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { addTransaction, TransactionType } from './actions'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'

const { TransactionResponse } = providers // for type

/**
 * @interface TransactionDetails
 * @property {string} hash
 * @property {SerializableTransactionReceipt} [receipt]
 * @property {number} [lastCheckedBlockNumber]
 * @property {number} [addedTime]
 * @property {number} [confirmedTime]
 * @property {string} from
 * @property {TransactionInfo} info
 */

/**
 * Helper that can take a ethers library transaction response and add it to the list of transactions
 * @return {(function(TransactionResponse, TransactionInfo): void)}
 */
export function useTransactionAdder() {
  const { chainId, account } = useActiveWeb3React()
  const dispatch = useDispatch()

  return useCallback(
    // TransactionResponse, TransactionInfo
    (response, info) => {
      if (!account) return
      if (!chainId) return

      const { hash } = response
      if (!hash) {
        throw Error('No transaction hash found.')
      }
      dispatch(addTransaction({
        hash, from: account, info, chainId,
      }))

      // logMonitoringEvent(info, response)
    },
    [account, chainId, dispatch],
  )
}

//
/**
 * Returns all the transactions (stored on state) for the current chain
 * @return {{[txHash: string]: TransactionDetails}}
 */
export function useAllTransactions() {
  const { chainId } = useActiveWeb3React()

  const state = useSelector((state) => state.transactions)

  return chainId ? state[chainId] ?? {} : {}
}

/**
 * @param {string} [transactionHash]
 * @return {TransactionDetails | undefined}
 */
export function useTransaction(transactionHash) {
  const allTransactions = useAllTransactions()
  return transactionHash ? allTransactions[transactionHash] : undefined
}

/**
 * @param {string} [transactionHash]
 * @return {boolean}
 */
export function useIsTransactionPending(transactionHash) {
  const transactions = useAllTransactions()

  if (!transactionHash || !transactions[transactionHash]) return false

  return !transactions[transactionHash].receipt
}

/**
 * @param {string} [transactionHash]
 * @return {boolean}
 */
export function useIsTransactionConfirmed(transactionHash) {
  const transactions = useAllTransactions()

  if (!transactionHash || !transactions[transactionHash]) return false

  return Boolean(transactions[transactionHash].receipt)
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param {TransactionDetails} tx TX to check for recency
 * @return {boolean}
 */
export function isTransactionRecent(tx) {
  return new Date().getTime() - tx.addedTime < 86_400_000
}

/**
 * Returns whether a token has a pending approval transaction
 * @param {string | undefined} tokenAddress
 * @param {string | undefined} spender
 * @return {boolean}
 */
export function useHasPendingApproval(tokenAddress, spender) {
  const allTransactions = useAllTransactions()
  return useMemo(
    () => typeof tokenAddress === 'string'
      && typeof spender === 'string'
      && Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        }
        if (tx.info.type !== TransactionType.APPROVAL) return false
        return tx.info.spender === spender && tx.info.tokenAddress === tokenAddress && isTransactionRecent(tx)
      }),
    [allTransactions, spender, tokenAddress],
  )
}

/**
 * Watch for submissions to claim. Return null if not done loading, undefined if not found
 * @param {string} [account]
 * @return {{claimSubmitted: boolean, claimTxn: (TransactionDetails | undefined)}}
 */
export function useUserHasSubmittedClaim(account) {
  const allTransactions = useAllTransactions()

  // get the txn if it has been submitted
  const claimTxn = useMemo(() => {
    const txnIndex = Object.keys(allTransactions).find((hash) => {
      const tx = allTransactions[hash]
      return tx.info.type === TransactionType.CLAIM && tx.info.recipient === account
    })
    return txnIndex && allTransactions[txnIndex] ? allTransactions[txnIndex] : undefined
  }, [account, allTransactions])

  return { claimSubmitted: Boolean(claimTxn), claimTxn }
}
