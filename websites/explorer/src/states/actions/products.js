import shop from '../api/shop'
import * as types from '../../constants/ActionTypes'

const receiveProducts = (products) => ({
  type: types.RECEIVE_PRODUCTS,
  products,
})

const getAll = () => (dispatch) => {
  shop.getProducts((products) => dispatch(receiveProducts(products)))
}

const addToCartUnsafe = (productId) => ({
  type: types.ADD_TO_CART,
  productId,
})

const addToCart = (productId) => (dispatch, getState) => {
  if (getState().products.byId[productId].inventory > 0) dispatch(addToCartUnsafe(productId))
}

const checkout = (products) => (dispatch, getState) => {
  const { cart } = getState()

  dispatch({
    type: types.CHECKOUT_REQUEST,
  })

  shop.buyProducts(products, () => {
    dispatch({
      type: types.CHECKOUT_SUCCESS,
      cart,
    })
    // Replace the line above with line below to rollback on failure:
    // dispatch({ type: types.CHECKOUT_FAILURE, cart })
  })
}

export default {
  getAll, addToCart, checkout,
}
