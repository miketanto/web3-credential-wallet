import { AccountInfo } from '@azure/msal-browser'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '../store'

// Define a type for the slice state
interface AuthState {
  account: AccountInfo | undefined,
}

// Define the initial state using that type
const initialState: AuthState = {
  account: undefined,
}

export const authSlice = createSlice({
  name: 'auth',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    // NOTE: should we accept `undefined` as well, ie. PayloadAction<AccountInfo | undefined>?
    signIn: (state, action: PayloadAction<AccountInfo>) => {
      state.account = action.payload
    },
    signOut: (state) => {
      state.account = undefined
    },
  },
})

export const { signIn, signOut } = authSlice.actions

// Other code such as selectors can use the imported `RootState` type
// export const selectAccount = (state: RootState): AccountInfo | undefined => state.auth.account

export default authSlice.reducer
