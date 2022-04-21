import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  balances: {},
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    updateBalances(state, action) {
      // console.log('chain', action.payload)
      const { balances } = action.payload
      state.balances = balances
    },
  },
})

const { actions, reducer } = walletSlice
export const { setNativeToken, updateBalances } = actions
export default reducer
