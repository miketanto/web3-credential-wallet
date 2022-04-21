const initialState = {
  account: null,
  error: null,
  idToken: null,
  accessToken: null,
  isAuthenticated: false,
}

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        account: action.payload,
        idToken: action.payload.idTokenClaims,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
      }

    case 'UPDATE_ERROR':
      return {
        ...state,
        error: action.payload,
        isAuthenticated: false,
      }

    case 'UPDATE_TOKEN':
      return {
        ...state,
        idToken: action.payload.idTokenClaims,
        accessToken: action.payload.accessToken,
      }

    default:
      return state
  }
}
