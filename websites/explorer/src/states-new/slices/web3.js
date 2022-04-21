import { createSlice } from '@reduxjs/toolkit'

import getLibrary from '../../utils/getLibrary'

/**
 * Our `web3` uses `ethers` v5.4
 * Documentation: https://docs.ethers.io/v5/api/providers/provider/
 *
 * We don't use `Web3` (another lib) because it's mainly for local node test.
 * `ethers.js` separates the node into two separate roles:
 * - A "wallet" that holds keys and signs transaction (for us, useWeb3React); [thus 'key management and state' is separation of concerns]
 * - A "provider" that serves as an anonymous connection to the ethereum network, checking state and sending transactions
 *
 * We need "provider" to pull blockchain data without connecting wallet (e.g. MetaMask)
 * and "wallet" to do user/address-specific transaction
 */

// READ: https://redux-toolkit.js.org/usage/usage-guide#simplifying-slices-with-createslice
const web3Slice = createSlice({
  name: 'web3',
  initialState: {
    isConnected: false,
    provider: null,
  },
  reducers: {
    setProvider(state) {
      // state.provider = getLibrary()
      // TODO: Check if provider is actually connected before setting true
      state.isConnected = true
    },
    unsetProvider(state) {
      state.provider = null
      state.isConnected = false
    },
  },
})

export const selectProvider = (state) => state.web3 // .web3.provider

const { actions, reducer } = web3Slice
export const { setProvider, unsetProvider } = actions
export default reducer
