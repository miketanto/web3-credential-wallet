import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { utils } from 'ethers'

import type { RootState } from '../store'

// Define a type for the slice state
interface UserState {
  addresses: string[],
}

// Define the initial state using that type
const initialState: UserState = {
  addresses: [], // set can't be serialized
}

export const userSlice = createSlice({
  name: 'user',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    addAddress: (state, action: PayloadAction<string>) => {
      if (utils.isAddress(action.payload)) state.addresses.push(action.payload)
    },
    removeAddress: (state, action: PayloadAction<string>) => {
      // if (utils.isAddress(action.payload)) state.addresses.delete(action.payload)
    },
  },
})

export const { addAddress } = userSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectAddresses = (state: RootState): string[] => state.user.addresses

export default userSlice.reducer
