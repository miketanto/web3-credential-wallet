import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import getFromCoreAPI from '../../utils/getFromCoreAPI'
import formatDistanceToNowStrict from '../../utils/formatDistanceToNowStrict'

const initialState = {
  blocks: {
    last: null,
    history: [],
  },
}

// Pulled from chain
const fetchLastBlock = createAsyncThunk(
  'chain/fetchLastBlock',
  async (arg, { getState }) => {
    const { web3 } = getState()
    if (!web3.isConnected || !web3.provider) return Promise.reject()
    try {
      const { provider } = web3
      const lastBlockNumber = await provider.getBlockNumber()
      return await provider.getBlock(lastBlockNumber)
    } catch (err) {
      console.log(err)
      return Promise.reject(err)
    }
  },
)

// Pulled from server
const fetchLastNBlocks = createAsyncThunk(
  'chain/fetchLastNBlocks',
  async (num, { getState }) => {
    try {
      const config = { params: { per_page: num } }
      const { payload: { blocks } } = getFromCoreAPI('/block/list', config)
      return blocks
    } catch (err) {
      console.log(err)
      return Promise.reject(err)
    }
  },
)

// READ: https://redux-toolkit.js.org/usage/usage-guide#simplifying-slices-with-createslice
const chainSlice = createSlice({
  name: 'chain',
  initialState,
  reducers: {
  },
  // async reducers
  extraReducers: {
    [fetchLastBlock.fulfilled]: (state, { payload }) => {
      if (state.lastBlock) state.blocks.history.unshift(state.blocks.last) // make last block first in history
      state.blocks.last = payload
    },
    [fetchLastNBlocks.fulfilled]: (state, { payload }) => {
      state.blocks.history = payload
    },
  },
})

const { actions, reducer } = chainSlice
// const {  } = actions // non-exports
export { fetchLastBlock, fetchLastNBlocks }
export default reducer
