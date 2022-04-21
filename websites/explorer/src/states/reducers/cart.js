import {
  ADD_TO_CART,
  CHECKOUT_REQUEST,
  CHECKOUT_FAILURE,
} from '../../constants/ActionTypes'

const initialState = {
  addedIds: [],
  quantityById: {},
}

const addedIds = (state = initialState.addedIds, action) => {
  if (action.type === ADD_TO_CART) {
    if (state.indexOf(action.productId) !== -1) return state
    return [...state, action.productId]
  }
  return state
}

const quantityById = (state = initialState.quantityById, action) => {
  if (action.type === ADD_TO_CART) {
    const { productId } = action
    return {
      ...state,
      [productId]: (state[productId] || 0) + 1,
    }
  }
  return state
}

export const getQuantity = (state, productId) => state.quantityById[productId] || 0

export const getAddedIds = (state) => state.addedIds

const cart = (state = initialState, action) => {
  if (action.type === CHECKOUT_REQUEST) return initialState
  if (action.type === CHECKOUT_FAILURE) return action.cart
  return {
    addedIds: addedIds(state.addedIds, action),
    quantityById: quantityById(state.quantityById, action),
  }
}

export default cart
