/**
 * Adapted from:
 * (1) https://github.com/Uniswap/interface/blob/main/src/state/multicall/hooks.ts
 * (2) https://github.com/Uniswap/redux-multicall/blob/main/src/hooks.ts
 */

import { BigNumber, utils } from 'ethers' // import utils for type
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useBlockNumber } from '../application/hooks'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'

/**
 * @interface Call
 * @property {string} address
 * @property {string} callData
 * @property {number} [gasRequired]
 *
 * @interface CallState
 * @property {boolean} valid
 * @property {CallStateResult | undefined} result - the result, or undefined if loading or errored/no data
 * @property {boolean} loading - true if the result has never been fetched
 * @property {boolean} syncing - true if the result is not for the latest block
 * @property {boolean} error - true if the call was made and is synced, but the return data is invalid
 *
 * @interface MulticallContext
 * @property {string} reducerPath
 * @property {MulticallActions} actions
 */

/**
 * @typedef {Array<MethodArg | MethodArg[] | undefined> | undefined} OptionalMethodInputs
 *
 * @typedef {string | number | BigNumber} MethodArg
 *
 * @typedef {Array<MethodArg | MethodArg[]>} MethodArgs
 *
 * @typedef {Object} ListenerOptions
 * @property @readonly {number} blocksPerFetch // how often this data should be fetched, by default 1
 *
 * @typedef {ListenerOptions} ListenerOptionsWithGas
 * @property @readonly {number} [gasRequired]
 */

/** @interface CallResult */
export const INVALID_RESULT = { valid: false, blockNumber: undefined, data: undefined }

/** @interface CallState */
const INVALID_CALL_STATE = {
  valid: false,
  result: undefined,
  loading: false,
  syncing: false,
  error: false,
}

/** @interface CallState */
const LOADING_CALL_STATE = {
  valid: true,
  result: undefined,
  loading: true,
  syncing: true,
  error: false,
}

const MulticallActions = [
  'multicall/addMulticallListeners',
  'multicall/removeMulticallListeners',
  'multicall/fetchingMulticallResults',
  'multicall/errorFetchingMulticallResults',
  'multicall/updateMulticallResults',
]

// export interface CallStateResult extends ReadonlyArray<any> {
//   readonly [key: string]: any
// }

/**
 * @param {Call} call
 * @return {string}
 */
function toCallKey(call) {
  let key = `${call.address}-${call.callData}`
  if (call.gasRequired) {
    if (!Number.isSafeInteger(call.gasRequired)) {
      throw new Error(`Invalid number: ${call.gasRequired}`)
    }
    key += `-${call.gasRequired}`
  }
  return key
}

/**
 * @param {string} callKey
 * @return {Call}
 */
function parseCallKey(callKey) {
  const pcs = callKey.split('-')
  if (![2, 3].includes(pcs.length)) {
    throw new Error(`Invalid call key: ${callKey}`)
  }
  return {
    address: pcs[0],
    callData: pcs[1],
    ...(pcs[2] ? { gasRequired: Number.parseInt(pcs[2]) } : {}),
  }
}

/**
 * @param {Array<Call | undefined>} [calls]
 */
export function callsToCallKeys(calls) {
  return (
    calls
      ?.filter((c) => Boolean(c))
      ?.map(toCallKey)
      ?.sort() ?? []
  )
}

/**
 * @param {string[]} callKeys
 * @return {null|*[]}
 */
export function callKeysToCalls(callKeys) {
  if (!callKeys?.length) return null
  return callKeys.map((key) => parseCallKey(key))
}

function useCallContext() {
  const { chainId } = useActiveWeb3React()
  const latestBlock = useBlockNumber()
  return { chainId, latestBlock }
}

/**
 * @param {?} x
 * @return {MethodArg}
 */
function isMethodArg(x) {
  return BigNumber.isBigNumber(x) || ['string', 'number'].indexOf(typeof x) !== -1
}

/**
 * @param {?} x
 * @return {MethodArg | undefined}
 */
export function isValidMethodArgs(x) {
  return (
    x === undefined
    || (Array.isArray(x) && x.every((xi) => isMethodArg(xi) || (Array.isArray(xi) && xi.every(isMethodArg))))
  )
}

/**
 *
 * @param {CallResult | undefined} callResult
 * @param {utils.Interface | undefined} contractInterface
 * @param {utils.FunctionFragment | undefined} fragment
 * @param {number | undefined} latestBlockNumber
 * @return {CallState}
 */
function toCallState(
  callResult,
  contractInterface,
  fragment,
  latestBlockNumber,
) {
  if (!callResult) return INVALID_CALL_STATE
  const { valid, data, blockNumber } = callResult
  if (!valid) return INVALID_CALL_STATE
  if (valid && !blockNumber) return LOADING_CALL_STATE
  if (!contractInterface || !fragment || !latestBlockNumber) return LOADING_CALL_STATE
  const success = data && data.length > 2
  const syncing = (blockNumber ?? 0) < latestBlockNumber
  let result // CallStateResult | undefined
  if (success && data) {
    try {
      result = contractInterface.decodeFunctionResult(fragment, data)
    } catch (error) {
      console.debug('Result data parsing failed', fragment, data)
      return {
        valid: true,
        loading: false,
        error: true,
        syncing,
        result,
      }
    }
  }
  return {
    valid: true,
    loading: false,
    syncing,
    result,
    error: !success,
  }
}

/**
 * The lowest level call for subscribing to contract data
 * @param {MulticallContext} context
 * @param {number | undefined} chainId
 * @param {Array<Call | undefined>} calls
 * @param {number} [blocksPerFetch = 1]
 * @return {CallResult[]}
 */
function useCallsDataSubscription(
  context,
  chainId,
  calls,
  blocksPerFetch = 1,
) {
  const { reducerPath, actions } = context
  const callResults = useSelector((state) => state[reducerPath].callResults)
  const dispatch = useDispatch()

  const serializedCallKeys = useMemo(() => JSON.stringify(callsToCallKeys(calls)), [calls])

  // update listeners when there is an actual change that persists for at least 100ms
  useEffect(() => {
    const callKeys = JSON.parse(serializedCallKeys)
    const calls = callKeysToCalls(callKeys)
    if (!chainId || !calls) return
    dispatch(
      actions.addMulticallListeners({
        chainId,
        calls,
        options: { blocksPerFetch },
      }),
    )

    return () => {
      dispatch(
        actions.removeMulticallListeners({
          chainId,
          calls,
          options: { blocksPerFetch },
        }),
      )
    }
  }, [actions, chainId, dispatch, blocksPerFetch, serializedCallKeys])

  return useMemo(
    // <CallResult>
    () => calls.map((call) => {
      if (!chainId || !call) return INVALID_RESULT
      const result = callResults[chainId]?.[toCallKey(call)]
      const data = result?.data && result.data !== '0x' ? result.data : undefined
      return { valid: true, data, blockNumber: result?.blockNumber }
    }),
    [callResults, calls, chainId],
  )
}

/**
 * Formats many calls to a single function on a single contract, with the function name and inputs specified
 * @param {MulticallContext} context
 * @param {number | undefined} chainId
 * @param {number | undefined} latestBlockNumber
 * @param {Contract | null | undefined} contract
 * @param {string} methodName
 * @param {OptionalMethodInputs[]} callInputs
 * @param {Partial<ListenerOptionsWithGas>} [options]
 * @return {CallState[]}
 */
function useSingleContractMultipleData(
  context,
  chainId,
  latestBlockNumber,
  contract,
  methodName,
  callInputs,
  options,
) {
  const { gasRequired, blocksPerFetch } = options ?? {}

  // Create ethers function fragment
  const fragment = useMemo(() => {
    if (contract.interface) contract.interface.getFunction(methodName)
  }, [contract, methodName])

  // Get encoded call data. Note can't use useCallData below b.c. this is  for a list of CallInputs
  const callDatas = useMemo(() => {
    if (!contract || !fragment) return []
    // <string | undefined>
    return callInputs.map((callInput) => (isValidMethodArgs(callInput) ? contract.interface.encodeFunctionData(fragment, callInput) : undefined))
  }, [callInputs, contract, fragment])

  // Create call objects
  const calls = useMemo(() => {
    if (!contract) return []
    // <Call | undefined>
    return callDatas.map((callData) => {
      if (!callData) return undefined
      return {
        address: contract.address,
        callData,
        gasRequired,
      }
    })
  }, [contract, callDatas, gasRequired])

  // Subscribe to call data
  const results = useCallsDataSubscription(context, chainId, calls, blocksPerFetch)

  return useMemo(() => results.map((result) => toCallState(result, contract.interface, fragment, latestBlockNumber)), [results, contract, fragment, latestBlockNumber])
}

/**
 *
 * @param {MulticallContext} context
 * @param {number | undefined} chainId
 * @param {number | undefined} latestBlockNumber
 * @param {Contract | null | undefined} contract
 * @param {string} methodName
 * @param {OptionalMethodInputs} [inputs]
 * @param {Partial<ListenerOptionsWithGas>} [options]
 * @return {CallState}
 */
function _useSingleCallResult(
  context,
  chainId,
  latestBlockNumber,
  contract,
  methodName,
  inputs,
  options,
) {
  return (
    useSingleContractMultipleData(context, chainId, latestBlockNumber, contract, methodName, [inputs], options)[0]
    ?? INVALID_CALL_STATE
  )
}

// Skip first two params (chainId & latestBlock is given here)
// eslint-disable-next-line import/prefer-default-export
export function useSingleCallResult(_1, _2, ...args) {
  const { chainId, latestBlock } = useCallContext()
  return _useSingleCallResult(chainId, latestBlock, ...args)
}
