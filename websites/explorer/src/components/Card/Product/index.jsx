import PropTypes from 'prop-types'
import React from 'react'
import { Link } from 'react-router-dom'

import classNames from '../../../utils/classNames'

import ProductHashtag from '../../Hashtag/Product'
import ReviewStars from '../../Review/Stars'

export default function ProductCard({ className, productInfo }) {
  const {
    id, name, img, price, discount, rating, hashtags,
  } = productInfo

  return (
    <div className={classNames('flex-1 overflow-hidden p-4 sm:py-6 sm:px-8 h-120', className)}>
      <Link to={`/shop/product/${id}`} className="w-full block text-black dark:text-white hover:text-altgeld">
        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
        <img
          src={`${process.env.PUBLIC_URL}/assets/products/${img}`}
          alt="photo"
          className="h-100 w-full rounded-lg"
        />
        <div className="w-full px-2 pt-3">
          <p className="text-md font-medium mb-1">{name}</p>
        </div>
      </Link>
      <div className="w-full px-2">
        {/* <p className="text-gray-400 dark:text-gray-300 font-light text-sm">{teaser}</p> */}
        <ReviewStars rating={rating} />
        <div className="mt-1 text-sm">
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
        { hashtags.length ? (
          <div className="flex flex-wrap justify-starts items-center mt-2">
            {/* eslint-disable-next-line react/no-array-index-key */}
            {hashtags.map((hashtag, idx) => <ProductHashtag key={`${idx}_${hashtag}`} name={hashtag} />)}
          </div>
        ) : '' }
      </div>
    </div>
  )
}

ProductCard.propTypes = {
  className: PropTypes.string,
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

ProductCard.defaultProps = {
  className: '',
}
