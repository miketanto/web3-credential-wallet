import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import ProductHashtag from '../../components/Hashtag/Product'
import ReviewStars from '../../components/Review/Stars'
import * as types from '../../constants/ActionTypes'
import Header from '../../layouts/marketplace/Header'
import { storeProducts } from '../../mock-data/store-products'
import { products as productActions } from '../../states/actions'
// import { getVisibleProducts } from '../states/reducers/products'

const { addToCart } = productActions

// eslint-disable-next-line react/prop-types
function Product() {
  const { id } = useParams()
  const data = storeProducts.find((el) => el.id === Number(id))

  const [quantity, setQuantity] = useState(1)

  // const cart = useSelector((state) => state.cart)
  const products = useSelector((state) => state.products)
  const dispatch = useDispatch()

  const {
    name, img, price, discount, rating, hashtags,
  } = data

  return (
    <div className="w-screen min-h-screen bg-gray-100 overflow-x-hidden">
      <Header />

      <div>
        <div className="max-w-7xl m-auto py-3 px-5 sm:py-5 sm:px-7">
          <main className="my-8">
            <div className="container mx-auto px-6">
              <div className="md:flex md:items-center">
                <div className="px-6 h-64 md:px-14 lg:h-96">
                  <img
                    className="min-h-full max-w-full rounded-md max-w-lg mx-auto"
                    src={`/assets/products/${img}`}
                    alt={name}
                  />
                </div>
                <div className="w-full max-w-lg mx-auto mt-5 md:ml-8 md:mt-0 md:w-1/2">
                  <div>
                    <div className="text-illini-blue uppercase font-bold text-2xl">{name}</div>
                    <div className="my-1">
                      <ReviewStars rating={rating} />
                    </div>
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
                    <div className="mt-1">
                      { hashtags.length ? (
                        <div className="flex flex-wrap justify-starts items-center mt-2">
                          {/* eslint-disable-next-line react/no-array-index-key */}
                          {hashtags.map((hashtag, idx) => <ProductHashtag key={`${idx}_${hashtag}`} name={hashtag} />)}
                        </div>
                      ) : '' }
                    </div>
                  </div>
                  <hr className="my-4" />
                  <div className="mt-2">
                    <div className="text-gray-700 text-sm">Quantity:</div>
                    <div className="flex items-center mt-1">
                      <FontAwesomeIcon
                        className="w-5 h-5 text-gray-500 focus:outline-none focus:text-gray-700 cursor-pointer"
                        icon="plus-circle"
                        onClick={() => setQuantity(Math.max(1, quantity + 1))}
                      />
                      <span className="text-gray-700 text-lg mx-2 select-none">{quantity}</span>
                      <FontAwesomeIcon
                        className="w-5 h-5 text-gray-500 focus:outline-none focus:text-gray-700 cursor-pointer"
                        icon="minus-circle"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      />
                    </div>
                  </div>
                  {
                    /*
                    <div className="mt-3">
                      <div className="text-gray-700 text-sm">Color:</div>
                      <div className="flex items-center mt-1">
                        <button type="button" className="h-5 w-5 rounded-full bg-blue-600 border-2 border-blue-200 mr-2 focus:outline-none">Buy</button>
                        <button type="button" className="h-5 w-5 rounded-full bg-teal-600 mr-2 focus:outline-none">Buy</button>
                        <button type="button" className="h-5 w-5 rounded-full bg-pink-600 mr-2 focus:outline-none">Buy</button>
                      </div>
                    </div>
                    */
                  }

                  <div className="flex items-center mt-6">
                    <button type="button" className="px-8 py-2 bg-altgeld text-white text-sm font-medium rounded hover:bg-illini-orange focus:outline-none focus:bg-illini-orange">Buy Now</button>
                    <button
                      type="button"
                      className="mx-2 text-gray-600 border rounded-md p-2 hover:bg-gray-200 focus:outline-none"
                      onClick={() => {
                        addToCart(id)

                        if (products.byId[id].inventory > 0) {
                          dispatch({
                            type: types.ADD_TO_CART,
                            productId: id,
                          })
                        }
                      }}
                    >
                      <span className="inline-block align-middle">
                        <FontAwesomeIcon className="h-5 w-5" icon="shopping-cart" />
                      </span>
                      <span className="inline-block align-middle ml-1">Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// const mapStateToProps = (state) => ({
//   products: getVisibleProducts(state.products),
// })
//
// export default connect(
//   mapStateToProps,
//   { addToCart },
// )(Product)
export default Product
