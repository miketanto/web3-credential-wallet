import { Contract, utils } from 'ethers'
import { useEffect, useMemo } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import { INVALID_CALL_STATE, INVALID_RESULT } from './constants'
import { callKeysToCalls, callsToCallKeys, toCallKey } from './utils/callKeys'
import { toCallState } from './utils/callState'
import { isValidMethodArgs, MethodArg } from './validation'
import { useBlockNumber } from '../application/hooks'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { parseCallKey } from './utils'

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
 * @interface CallContext
 * @property {string} reducerPath
 * @property {CallActions} actions
 *
 *
 * @typedef {MethodArg | MethodArg[] | undefined} OptionalMethodInput
 *
 * @typedef {Object} ListenerOptions
 * @property @readonly {number} blocksPerFetch // how often this data should be fetched, by default 1
 *
 * @typedef {ListenerOptions} ListenerOptionsWithGas
 * @property @readonly {number} [gasRequired]
 */

function useCallContext() {
  const { chainId } = useActiveWeb3React()
  const latestBlock = useBlockNumber()
  return { chainId, latestBlock }
}

/**
 * @param {CallContext} context
 * @param {number | undefined} chainId
 * @param {Call | undefined} call
 * @param {number} [blocksPerFetch=1]
 * @return {CallResult}
 */
function useCallDataSubscription(context, chainId, call, blocksPerFetch = 1) {
  const { reducerPath, actions } = context
  const callResults = useSelector((state) => state[reducerPath].callResults) // WithCallState
  const dispatch = useDispatch()

  const serializedCallKey = useMemo(() => JSON.stringify(toCallKey(call)), [call])

  // update listeners when there is an actual change that persists for at least 100ms
  useEffect(() => {
    const callKey = JSON.parse(serializedCallKey)
    const call = parseCallKey(callKey)
    if (!chainId || !call) return
    dispatch(
      actions.addCallListeners({
        chainId,
        call,
        options: { blocksPerFetch },
      }),
    )

    return () => {
      dispatch(
        actions.removeMulticallListeners({
          chainId,
          call,
          options: { blocksPerFetch },
        }),
      )
    }
  }, [actions, chainId, dispatch, blocksPerFetch, serializedCallKey])

  return useMemo(
    () => {
      if (!chainId || !call) return INVALID_RESULT
      try {
        const result = callResults[chainId][toCallKey(call)]
        const data = result.data && result.data !== '0x' ? result.data : undefined
        return { valid: true, data, blockNumber: result.blockNumber }
      } catch (err) {
        console.log(err)
        return { valid: true, undefined, blockNumber: null }
      }
    },
    [callResults, call, chainId],
  )
}

/**
 *
 * @param {CallContext} context
 * @param {number | undefined} chainId
 * @param {number | undefined} latestBlockNumber
 * @param {Contract | null | undefined} contract
 * @param {string} methodName
 * @param {OptionalMethodInputs} callInput
 * @param {Partial<ListenerOptionsWithGas>} [options]
 * @return {CallState}
 */
export function useSingleContract(
  context,
  chainId,
  latestBlockNumber,
  contract,
  methodName,
  callInput,
  options,
) {
  const { gasRequired, blocksPerFetch } = options ?? {}

  // Create ethers function fragment
  const fragment = useMemo(() => {
    try {
      return contract.interface.getFunction(methodName)
    } catch (err) {
      console.log(err)
      return null
    }
  }, [contract, methodName])

  // Get encoded call data. Note can't use useCallData below b.c. this is for CallInput
  const callData = useMemo(() => {
    if (!contract || !fragment) return []
    return isValidMethodArgs(callInput) ? contract.interface.encodeFunctionData(fragment, callInput) : null
  }, [callInput, contract, fragment])

  // Create call object
  const call = useMemo(() => {
    if (!contract) return []
    if (!callData) return undefined
    return {
      address: contract.address,
      callData,
      gasRequired,
    }
  }, [contract, callData, gasRequired])

  // Subscribe to call data
  const result = useCallDataSubscription(context, chainId, call, blocksPerFetch)

  // return useMemo(() => results.map((result) => toCallState(result, contract.interface, fragment, latestBlockNumber)), [results, contract, fragment, latestBlockNumber])
  return useMemo(() => toCallState(result, contract.interface, fragment, latestBlockNumber), [result, contract, fragment, latestBlockNumber])
}

/**
 *
 * @param {CallContext} context
 * @param {number | undefined} chainId
 * @param {number | undefined} latestBlockNumber
 * @param {Contract | null | undefined} contract
 * @param {string} methodName
 * @param {OptionalMethodInputs} [input]
 * @param {Partial<ListenerOptionsWithGas>} [options]
 */
export function useSingleCallResult(
  context,
  chainId,
  latestBlockNumber,
  contract,
  methodName,
  input,
  options,
) {
  return useSingleContract(context, chainId, latestBlockNumber, contract, methodName, input, options) ?? INVALID_CALL_STATE
  // (
  //   // useSingleContractMultipleData(context, chainId, latestBlockNumber, contract, methodName, [inputs], options)[0] ??
  //   useSingleContractMultipleData(context, chainId, latestBlockNumber, contract, methodName, [inputs], options)[0] ??
  //   INVALID_CALL_STATE
  // )
}
