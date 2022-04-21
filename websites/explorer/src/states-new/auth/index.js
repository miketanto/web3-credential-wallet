import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { InteractionRequiredAuthError, InteractionStatus } from '@azure/msal-browser'
import { isPast } from 'date-fns'
import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import getAccount from '../../utils/getAccount'
import getSignInRequest from '../../utils/getSignInRequest'
import getSignOutRequest from '../../utils/getSignOutRequest'
// import { msalConfig } from '../../configs/azure/auth-config'

const initialState = {
  accessToken: null,
  account: {},
  error: null,
  isAuthenticated: false,
  isLoading: false,
  // idToken: null,
}

export const signIn = createAsyncThunk(
  'auth/signIn',
  /**
   * @param {IPublicClientApplication} instance
   */
  async (instance, { rejectWithValue }) => {
    // Empty data template (returned as is if rejected, otherwise populated with account data from Microsoft)
    const data = {
      account: {},
      accessToken: null,
      isAuthenticated: false,
      username: null,
    }

    try {
      const res = await instance.loginPopup(getSignInRequest())
      const account = res !== null ? res.account : getAccount(instance)
      data.account = account
      // data.accessToken = account.accessToken // access token is not provided on when user signs in
      data.isAuthenticated = true
      data.username = account.username
      return data
    } catch (err) {
      console.error(err)
      return rejectWithValue(data)
    }
  },
)

export const signOut = createAsyncThunk(
  'auth/signOut',
  /**
   * @param {IPublicClientApplication} instance
   */
  async (instance) => {
    // Must come before the login redirect. Called once loginRedirect succeeds
    const prom = instance.handleRedirectPromise()
      .then((res) => res)
      .catch((err) => {
        console.log(err)
        return err
      })

    instance.logoutRedirect(getSignOutRequest(instance)) // Don't await this one. Since it's a redirect, await is lost anyways.
    await prom // await before returning
    return prom
  },
)

export const getAccessToken = createAsyncThunk(
  'auth/getAccessToken',
  async ({
    accounts, isAzureAuthenticated, inProgress, instance,
  }, { dispatch }) => {
    try {
      // Some interaction is going on between the app & Microsoft (probably sign in/out),
      // so skip acquiring the token (ie. wait for the interaction to end). If we don't do this,
      // then react-aad will be stuck in refresh loop with console error (Interaction is in progress)
      if (inProgress !== InteractionStatus.None) {
        // Don't throw error here, just ignore this access token process
        console.log('INTERACTION IN PROGRESS!')
        return
      }

      // No interaction is happening; check for all other catches
      if (
        accounts.length === 0
        || (inProgress === InteractionStatus.None && !isAzureAuthenticated)
        // token claims has expired, make user login again
        || isPast(new Date(accounts[0].idTokenClaims.exp * 1000))) {
        // history.push('/signin')
        throw new Error('Invalid or expired account data!')
      }

      const tokenRequest = { account: accounts[0], scopes: ['User.Read'] }

      try {
        const res = await instance.acquireTokenSilent(tokenRequest)
        if (res.accessToken) return res
        throw new Error('Response from MSAL AAD doesn\'t contain access token!')
      } catch (err) {
        if (err instanceof InteractionRequiredAuthError) {
          console.log('Acquiring token using popup')
          return instance.acquireTokenPopup(tokenRequest)
            .catch((err) => {
              throw err
            })
        }
        throw err
      }
    } catch (err) {
      console.log(err)
      dispatch(signIn(instance))
      return Promise.reject()
      // return rejectWithValue(instance)
    }
  },
)

export const updateAccount = (state, action) => {
  // No need for promise returns
  try {
    // action
    console.log('<==================== UPDATE ACCOUNT ====================>')
    console.log(action)
    if (!action.payload) return // Promise.reject()

    state.accessToken = action.payload.accessToken
    state.account = action.payload
    state.isAuthenticated = true
    // state.idToken = account.idTokenClaims
  } catch (err) {
    console.log(err)
  }
}

export const updateToken = (state, action) => {
  // No need for promise returns
  try {
    console.log('<==================== UPDATE TOKEN ====================>')
    console.log(action)
    if (!action.payload || !action.payload.account) return // Promise.reject()

    state.accessToken = action.payload.accessToken
    state.account = action.payload.account
    state.isAuthenticated = true
    // state.idToken = payload.idTokenClaims
  } catch (err) {
    console.log(err)
  }
}

// READ: https://redux-toolkit.js.org/usage/usage-guide#simplifying-slices-with-createslice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAccount,
    updateError(state, { payload }) {
      state.error = payload
      state.isAuthenticated = false
    },
    updateToken,
  },
  extraReducers: (builder) => {
    function resetAuthState(state) {
      state.accessToken = null
      state.account = {}
      state.error = null
      state.isAuthenticated = false
      // state.idToken = null
    }

    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true
        resetAuthState(state)
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false
        updateAccount(state, action)
      })
      .addCase(signIn.rejected, (state) => {
        state.isLoading = false
        resetAuthState(state)
      })
      .addCase(signOut.pending, (state) => {
        state.isLoading = true
        resetAuthState(state)
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false
        resetAuthState(state)
      })
      .addCase(signOut.rejected, (state) => {
        state.isLoading = false
        resetAuthState(state)
      })
      .addCase(getAccessToken.pending, (state) => {
        state.accessToken = null
        // state.idToken = null
      })
      .addCase(getAccessToken.fulfilled, updateToken)
      .addCase(getAccessToken.rejected, (state) => {
        state.accessToken = null
        // state.idToken = null
      })
  },
})

const { actions, reducer } = authSlice
export const { updateError } = actions
export default reducer

export const selectAccessToken = (state) => state.auth.accessToken
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectUserAccount = (state) => state.auth.account
