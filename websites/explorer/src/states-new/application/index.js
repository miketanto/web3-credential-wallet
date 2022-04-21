import { createSlice } from '@reduxjs/toolkit'

/**
 * @interface {Object} ApplicationState
 * @property @readonly {[chainId: number]: number} blockNumber
 * @property @readonly {number | null} chainId
 */

const initialState = {
  blockNumber: {},
  chainId: null,
}

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    updateChainId(state, action) {
      // console.log('chain', action.payload)
      const { chainId } = action.payload
      state.chainId = chainId
    },
    updateBlockNumber(state, action) {
      // console.log('block', action.payload)
      const { chainId, blockNumber } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    },
  },
})

const { actions, reducer } = applicationSlice
export const { updateChainId, updateBlockNumber } = actions
export default reducer
