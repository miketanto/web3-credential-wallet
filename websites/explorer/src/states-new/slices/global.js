import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  location: {
    current: '/',
    previous: null,
  },
}

// READ: https://redux-toolkit.js.org/usage/usage-guide#simplifying-slices-with-createslice
const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    updateLocation(state, action) {
      state.location.previous = state.location.current
      state.location.current = action.payload
    },
  },
})

const { actions, reducer } = globalSlice
export const { updateLocation } = actions
export default reducer
