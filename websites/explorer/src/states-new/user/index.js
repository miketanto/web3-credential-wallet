import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  profile: {
    id: null,
    principalName: null,
    givenName: null,
    surname: null,
    jobTitle: null,
    mobilePhone: null,
    preferredLanguage: null,
    firstLogin: true,
  },
}

// READ: https://redux-toolkit.js.org/usage/usage-guide#simplifying-slices-with-createslice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile(state, { payload }) {
      state.profile.id = payload.id
      state.profile.principalName = payload.userPrincipalName
      state.profile.givenName = payload.givenName
      state.profile.surname = payload.surname
      state.profile.jobTitle = payload.jobTitle
      state.profile.mobilePhone = payload.mobilePhone
      state.profile.preferredLanguage = payload.preferredLanguage
      state.profile.firstLogin = false
    },
  },
  // extraReducers: (builder) => {
  //   // Add reducers for additional action types here, and handle loading state as needed
  //   builder.addCase(fetchUserById.fulfilled, (state, action) => {
  //     // Add user to the state array
  //     state.entities.push(action.payload)
  //   })
  // },
})

const { actions, reducer } = userSlice
export const { updateProfile } = actions
export default reducer
