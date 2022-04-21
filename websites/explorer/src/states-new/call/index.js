// Adapted from https://github.com/Uniswap/redux-multicall/blob/main/src/create.ts

import {
  useSingleCallResult as _useSingleCallResult,
  // useSingleContractWithCallData as _useSingleContractWithCallData,
} from './hooks'
import createCallSlice from './slice'

const call = (function createCall() {
  const reducerPath = 'call'
  const slice = createCallSlice(reducerPath)
  const { actions, reducer } = slice
  /** @type CallContext * */
  const context = { reducerPath, actions }

  // Skip first argument (`context` is provided here)
  const useSingleCallResult = (_, ...args) => _useSingleCallResult(context, ...args)

  // Import these hooks to be used in the app, since `context` is contained & provided here
  const hooks = {
    useSingleCallResult,
  }

  return {
    reducerPath,
    reducer,
    actions,
    hooks,
  }
}())

export const {
  addCallListeners, removeCallListeners, fetchingCallResults, errorFetchingCallResults, updateCallResults,
} = call.actions
export const { useSingleCallResult } = call.hooks
export default call.reducer
