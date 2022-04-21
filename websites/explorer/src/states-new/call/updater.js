import React, { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { CHUNK_GAS_LIMIT, DEFAULT_CALL_GAS_REQUIRED, FETCH_RETRY_CONFIG } from './constants'
import useDebounce from '../../hooks/useDebounce'
import { chunkCalls, parseCallKey, toCallKey } from './utils'
import { retry, RetryableError } from '../../utils/retry'
import { useBlockNumber } from '../application/hooks'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'

/**
 * Fetches a chunk of calls, enforcing a minimum block number constraint
 * @param {InterfaceCall} callContract Call contract to fetch against
 * @param {Call} chunk call to make
 * @param {number} blockNumber block number passed as the block tag in the eth_call
 * @param {boolean} [isDebug]
 * @return {Promise<{success: boolean, returnData: string}>}
 */
async function fetchChunk(callContract, chunk, blockNumber, isDebug) {
  console.debug('Fetching chunk', chunk, blockNumber)
  try {
    // const data = await
    const { returnData } = await callContract.callStatic.multicall(
      chunk.map((obj) => ({
        target: obj.address,
        callData: obj.callData,
        gasLimit: obj.gasRequired ?? DEFAULT_CALL_GAS_REQUIRED,
      })),
      // we aren't passing through the block gas limit we used to create the chunk, because it causes a problem with the integ tests
      { blockTag: blockNumber },
    )

    if (isDebug) {
      returnData.forEach(({ gasUsed, returnData, success }, i) => {
        if (
          !success
          && returnData.length === 2
          && gasUsed.gte(Math.floor((chunk[i].gasRequired ?? DEFAULT_CALL_GAS_REQUIRED) * 0.95))
        ) {
          console.warn(
            `A call failed due to requiring ${gasUsed.toString()} vs. allowed ${
              chunk[i].gasRequired ?? DEFAULT_CALL_GAS_REQUIRED
            }`,
            chunk[i],
          )
        }
      })
    }

    return returnData
  } catch (error) {
    if (error.code === -32000 || error.message?.indexOf('header not found') !== -1) {
      throw new RetryableError(`header not found for block number ${blockNumber}`)
    } else if (error.code === -32603 || error.message?.indexOf('execution ran out of gas') !== -1) {
      if (chunk.length > 1) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('Splitting a chunk in 2', chunk)
        }
        const half = Math.floor(chunk.length / 2)
        const [c0, c1] = await Promise.all([
          fetchChunk(callContract, chunk.slice(0, half), blockNumber),
          fetchChunk(callContract, chunk.slice(half, chunk.length), blockNumber),
        ])
        return c0.concat(c1)
      }
    }
    console.error('Failed to fetch chunk', error)
    throw error
  }
}

/**
 * From the current all listeners state, return each call key mapped to the
 * minimum number of blocks per fetch. This is how often each key must be fetched.
 * @param {MulticallState['callListeners']} allListeners the all listeners state
 * @param {number} [chainId] the current chain id
 * @return {{ [callKey: string]: number }}
 */
export function activeListeningKeys(allListeners, chainId) {
  if (!allListeners || !chainId) return {}
  const listeners = allListeners[chainId]
  if (!listeners) return {}
  console.log(listeners)

  // reduce<{ [callKey: string]: number }>
  return Object.keys(listeners).reduce((memo, callKey) => {
    const keyListeners = listeners[callKey]

    memo[callKey] = Object.keys(keyListeners)
      .filter((key) => {
        const blocksPerFetch = parseInt(key)
        if (blocksPerFetch <= 0) return false
        return keyListeners[blocksPerFetch] > 0
      })
      .reduce((previousMin, current) => Math.min(previousMin, parseInt(current)), Infinity)
    return memo
  }, {})
}

/**
 * Return the keys that need to be refetched
 * @param {CallState['callResults']} callResults current call result state
 * @param {{{ [callKey: string]: number }}} listeningKeys each call key mapped to how old the data can be in blocks
 * @param {number | undefined} chainId the current chain id
 * @param {number | undefined} latestBlockNumber the latest block number
 * @return {string[]}
 */
export function outdatedListeningKeys(callResults, listeningKeys, chainId, latestBlockNumber) {
  if (!chainId || !latestBlockNumber) return []
  const results = callResults[chainId]
  // no results at all, load everything
  if (!results) return Object.keys(listeningKeys)

  return Object.keys(listeningKeys).filter((callKey) => {
    const blocksPerFetch = listeningKeys[callKey]

    const data = callResults[chainId][callKey]
    // no data, must fetch
    if (!data) return true

    const minDataBlockNumber = latestBlockNumber - (blocksPerFetch - 1)

    // already fetching it for a recent enough block, don't refetch it
    if (data.fetchingBlockNumber && data.fetchingBlockNumber >= minDataBlockNumber) return false

    // if data is older than minDataBlockNumber, fetch it
    return !data.blockNumber || data.blockNumber < minDataBlockNumber
  })
}

/**
 * @interface FetchChunkContext
 * @property {MulticallActions} actions
 * @property {Dispatch<any>} dispatch
 * @property {number} chainId
 * @property {number} latestBlockNumber
 * @property {boolean} [isDebug]
 */
/**
 *
 * @param {FetchChunkContext} context
 * @param {Call[]} chunk
 * @param {Array<{ success: boolean; returnData: string }>} result
 */

function onFetchChunkSuccess(context, chunk, result) {
  const {
    actions, dispatch, chainId, latestBlockNumber, isDebug,
  } = context

  // split the returned slice into errors and results
  // <{
  //     erroredCalls: Call[]
  //     results: { [callKey: string]: string | null }
  // }>
  const { erroredCalls, results } = chunk.reduce(
    (memo, call, i) => {
      if (result[i].success) {
        memo.results[toCallKey(call)] = result[i].returnData ?? null
      } else {
        memo.erroredCalls.push(call)
      }
      return memo
    },
    { erroredCalls: [], results: {} },
  )

  // dispatch any new results
  if (Object.keys(results).length > 0) {
    dispatch(
      actions.updateMulticallResults({
        chainId,
        results,
        blockNumber: latestBlockNumber,
      }),
    )
  }

  // dispatch any errored calls
  if (erroredCalls.length > 0) {
    if (isDebug) {
      result.forEach((returnData, ix) => {
        if (!returnData.success) {
          console.debug('Call failed', chunk[ix], returnData)
        }
      })
    } else {
      console.debug('Calls errored in fetch', erroredCalls)
    }
    dispatch(
      actions.errorFetchingMulticallResults({
        calls: erroredCalls,
        chainId,
        fetchingBlockNumber: latestBlockNumber,
      }),
    )
  }
}

/**
 *
 * @param {FetchChunkContext} context
 * @param {Call[]} chunk
 * @param {any} error
 */
function onFetchChunkFailure(context, chunk, error) {
  const {
    actions, dispatch, chainId, latestBlockNumber,
  } = context

  if (error.isCancelledError) {
    console.debug('Cancelled fetch for blockNumber', latestBlockNumber, chunk, chainId)
    return
  }
  console.error('Failed to fetch multicall chunk', chunk, chainId, error)
  dispatch(
    actions.errorFetchingMulticallResults({
      calls: chunk,
      chainId,
      fetchingBlockNumber: latestBlockNumber,
    }),
  )
}

/**
 * @interface UpdaterProps
 * @property {CallContext} context
 * @property {number | undefined} chainId // For now, one updater is required for each chainId to be watched
 * @property {number | undefined} lastBlockNumber
 * @property {UniswapInterfaceMulticall} contract
 * @property {boolean} [isDebug]
 *
 * @param {UpdaterProps} props
 */
function Updater({
  context, chainId, latestBlockNumber, contract, isDebug,
}) {
  // Here,
  // reducerPath = 'call'
  // {
  //   addCallListeners, removeCallListeners, fetchingCallResults, errorFetchingCallResults, updateCallResults,
  // } = actions
  const { actions, reducerPath } = context

  const dispatch = useDispatch()
  const state = useSelector((_state) => _state[reducerPath]) // WithMulticallState

  // Wait for listeners to settle before triggering updates
  const debouncedListeners = useDebounce(state.callListeners, 100)
  const cancellations = useRef() // <{ blockNumber: number; cancellations: (() => void)[] }>

  // { [callKey: string]: number }
  const listeningKeys = useMemo(() => activeListeningKeys(debouncedListeners, chainId), [debouncedListeners, chainId])
  console.log('Active listening keys: ', listeningKeys)

  const serializedOutdatedCallKeys = useMemo(() => {
    const outdatedCallKeys = outdatedListeningKeys(state.callResults, listeningKeys, chainId, latestBlockNumber)
    console.log('Outdated call keys: ', outdatedCallKeys)
    return JSON.stringify(outdatedCallKeys.sort())
  }, [chainId, state.callResults, listeningKeys, latestBlockNumber])

  useEffect(() => {
    if (!latestBlockNumber || !chainId || !contract) return

    const outdatedCallKeys = JSON.parse(serializedOutdatedCallKeys)
    if (outdatedCallKeys.length === 0) return
    const calls = outdatedCallKeys.map((key) => parseCallKey(key))

    // divide calls into chunks based on max gas limit per chunk
    const chunkedCalls = chunkCalls(calls, CHUNK_GAS_LIMIT)

    if (cancellations.current && cancellations.current.blockNumber !== latestBlockNumber) {
      cancellations.current.cancellations.forEach((c) => c())
    }

    dispatch(
      actions.fetchingCallResults({
        calls,
        chainId,
        fetchingBlockNumber: latestBlockNumber,
      }),
    )

    const fetchChunkContext = {
      actions,
      dispatch,
      chainId,
      latestBlockNumber,
      isDebug,
    }
    // Execute fetches and gather cancellation callbacks
    const newCancellations = chunkedCalls.map((chunk) => {
      const { cancel, promise } = retry(
        () => fetchChunk(contract, chunk, latestBlockNumber, isDebug),
        FETCH_RETRY_CONFIG,
      )
      promise
        .then((result) => onFetchChunkSuccess(fetchChunkContext, chunk, result))
        .catch((error) => onFetchChunkFailure(fetchChunkContext, chunk, error))
      return cancel
    })

    cancellations.current = {
      blockNumber: latestBlockNumber,
      cancellations: newCancellations,
    }
  }, [actions, chainId, contract, dispatch, serializedOutdatedCallKeys, latestBlockNumber, isDebug])

  return null
}

/**
 * @param {CallContext} context
 * @return {function(Omit<UpdaterProps, "context">)}
 */
export function createUpdater(context) {
  const UpdaterContextBound = (props) => {
    props.context = context
    // eslint-disable-next-line react/jsx-filename-extension
    return <Updater {...props} />
  }
  return UpdaterContextBound
}

// Create Updater wrappers that pull needed info from store
export default function UpdaterWrapper() {
  const latestBlockNumber = useBlockNumber()
  const { chainId } = useActiveWeb3React()
  // const call2Contract = useInterfaceMulticall()
  const call2Contract = null
  return <Updater chainId={chainId} latestBlockNumber={latestBlockNumber} contract={call2Contract} />
}
