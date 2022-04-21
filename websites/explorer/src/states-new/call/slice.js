// Adapted from https://github.com/Uniswap/redux-multicall/blob/main/src/slice.ts#L14

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { toCallKey } from './utils'

// CallState
const initialState = {
  callResults: {},
}

/**
 * @interface CallListenerPayload
 * @property {number} chainId
 * @property {Call} call
 * @property {ListenerOptions} options
 *
 * @interface CallFetchingPayload
 * @property {number} chainId
 * @property {Call} call
 * @property {number} fetchingBlockNumber
 *
 * @interface CallResultsPayload
 * @property {number} chainId
 * @property {number} blockNumber
 * @property {{[callKey: string]: string | null}} result
 */

/**
 * @param {string} reducerPath
 * @return {Slice<{callResults: {}}, {updateMulticallResults: reducers.updateMulticallResults, removeMulticallListeners: reducers.removeMulticallListeners, fetchingMulticallResults: reducers.fetchingMulticallResults, addMulticallListeners: reducers.addMulticallListeners, errorFetchingMulticallResults: reducers.errorFetchingMulticallResults}, string>}
 */
export default function createCallSlice(reducerPath) {
  return createSlice({
    name: reducerPath,
    initialState,
    reducers: {
      /**
       * @param state
       * @param {PayloadAction<CallListenerPayload>} action
       */
      addCallListeners: (state, action) => {
        const {
          calls,
          chainId,
          options: { blocksPerFetch },
        } = action.payload

        // type CallState['callListeners']
        const listeners = state.callListeners ? state.callListeners : (state.callListeners = {})
        listeners[chainId] = listeners[chainId] ?? {}

        calls.forEach((call) => {
          const callKey = toCallKey(call)
          listeners[chainId][callKey] = listeners[chainId][callKey] ?? {}
          listeners[chainId][callKey][blocksPerFetch] = (listeners[chainId][callKey][blocksPerFetch] ?? 0) + 1
        })
      },

      /**
       * @param state
       * @param {PayloadAction<CallListenerPayload>} action
       */
      removeCallListeners: (state, action) => {
        const {
          calls,
          chainId,
          options: { blocksPerFetch },
        } = action.payload

        // type CallState['callListeners']
        const listeners = state.callListeners ? state.callListeners : (state.callListeners = {})
        if (!listeners[chainId]) return

        calls.forEach((call) => {
          const callKey = toCallKey(call)
          if (!listeners[chainId][callKey]) return
          if (!listeners[chainId][callKey][blocksPerFetch]) return

          if (listeners[chainId][callKey][blocksPerFetch] === 1) {
            delete listeners[chainId][callKey][blocksPerFetch]
          } else {
            listeners[chainId][callKey][blocksPerFetch]--
          }
        })
      },

      /**
       * @param state
       * @param {PayloadAction<CallFetchingPayload>} action
       */
      fetchingCallResults: (state, action) => {
        const { chainId, fetchingBlockNumber, calls } = action.payload
        state.callResults[chainId] = state.callResults[chainId] ?? {}
        calls.forEach((call) => {
          const callKey = toCallKey(call)
          const current = state.callResults[chainId][callKey]
          if (!current) {
            state.callResults[chainId][callKey] = {
              fetchingBlockNumber,
            }
          } else {
            if ((current.fetchingBlockNumber ?? 0) >= fetchingBlockNumber) return
            state.callResults[chainId][callKey].fetchingBlockNumber = fetchingBlockNumber
          }
        })
      },

      /**
       * @param state
       * @param {PayloadAction<CallFetchingPayload>} action
       */
      errorFetchingCallResults: (state, action) => {
        const { chainId, fetchingBlockNumber, calls } = action.payload
        state.callResults[chainId] = state.callResults[chainId] ?? {}
        calls.forEach((call) => {
          const callKey = toCallKey(call)
          const current = state.callResults[chainId][callKey]
          if (!current || typeof current.fetchingBlockNumber !== 'number') return // only should be dispatched if we are already fetching
          if (current.fetchingBlockNumber <= fetchingBlockNumber) {
            delete current.fetchingBlockNumber
            current.data = null
            current.blockNumber = fetchingBlockNumber
          }
        })
      },

      /**
       * @param state
       * @param {PayloadAction<CallResultPayload>} action
       */
      updateCallResults: (state, action) => {
        const { chainId, results, blockNumber } = action.payload
        state.callResults[chainId] = state.callResults[chainId] ?? {}
        Object.keys(results).forEach((callKey) => {
          const current = state.callResults[chainId][callKey]
          if ((current?.blockNumber ?? 0) > blockNumber) return
          state.callResults[chainId][callKey] = {
            data: results[callKey],
            blockNumber,
          }
        })
      },
    },
  })
}

// <typeof createCallSlice>
// export type CallActions = ReturnType['actions']
