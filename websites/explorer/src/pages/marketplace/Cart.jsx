import PropTypes from 'prop-types'
import React from 'react'
import { useSelector } from 'react-redux'
// import { connect } from 'react-redux'

import Header from '../../layouts/marketplace/Header'
// import { checkout } from '../states/actions'
// import { getTotal, getCartProducts } from '../states/reducers'

function Product({ productInfo }) {
  const {
    name, img, price, discount,
  } = productInfo

  return (
    <div className="flex w-50 py-4 px-10 m-auto">
      <div className="px-2 h-14 md:px-4 lg:h-24">
        <img
          className="max-h-full max-w-full rounded-md max-w-lg mx-auto"
          src={`/assets/products/${img}`}
          alt={name}
        />
      </div>
      <div>
        <div className="text-illini-blue text-xl font-bold">{name}</div>
        <div className="text-black mt-3">
          <span className="text-2xl font-extrabold mr-1">{discount || price}</span>
          Gies
          { discount ? (
            <span className="pl-2 text-xs text-gray-500 dark:text-gray-300">
              Original:
              <span className="line-through">
                <span className="text-xl font-bold mx-1">{price}</span>
                Gies
              </span>
            </span>
          ) : '' }
        </div>
      </div>
    </div>
  )
}

Product.propTypes = {
  productInfo: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    brand: PropTypes.string,
    rating: PropTypes.number,
    teaser: PropTypes.string,
    img: PropTypes.string,
    price: PropTypes.number,
    discount: PropTypes.number,
    hashtags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
}

function Cart() {
  const cart = useSelector((state) => state.cart)
  const products = useSelector((state) => state.products)
  // const dispatch = useDispatch()

  console.log(cart)

  const hasProducts = cart.addedIds.length > 0
  let productList = <em>Please add some products to cart.</em>
  if (hasProducts) {
    productList = cart.addedIds.map((id) => {
      const productInfo = products.byId[id]
      return <Product key={id} productInfo={productInfo} />
    })
  }
  return (
    <div className="w-screen min-h-screen bg-gray-100 overflow-x-hidden">
      <Header />

      <div>
        <h3>Your Cart</h3>
        <div className="w-7xl py-6 px-10 m-auto">
          {productList}
        </div>
      </div>
    </div>
  )
}

Cart.propTypes = {
  // products: PropTypes.arrayOf(PropTypes.shape({
  //   id: PropTypes.number.isRequired,
  //   title: PropTypes.string.isRequired,
  //   price: PropTypes.number.isRequired,
  //   // quantity: PropTypes.number.isRequired,
  // })).isRequired,
  // total: PropTypes.string.isRequired,
}

// const mapStateToProps = (state) => ({
//   products: getCartProducts(state),
//   total: getTotal(state),
// })
//
// export default connect(
//   mapStateToProps,
//   { checkout },
// )(CartContainer)

export default Cart
