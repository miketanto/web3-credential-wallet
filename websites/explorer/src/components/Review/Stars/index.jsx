import React from 'react'
import PropTypes from 'prop-types'

import Star from './star'

// NOTE: Current reviews are rounded down to nearest integer
// TODO: Half-filled stars to accommodate decimal reviews
function ReviewStars({ size, rating, maxRating }) {
  return (
    <div className="flex justify-start items-center">
      {/* eslint-disable-next-line react/no-array-index-key */}
      { Array(maxRating).fill(0).fill(1, 0, rating).map((v, i) => <Star key={i} isFilled={!!v} size={size} />) }
    </div>
  )
}

ReviewStars.propTypes = {
  size: PropTypes.number,
  rating: PropTypes.number.isRequired,
  maxRating: PropTypes.number,
}

ReviewStars.defaultProps = {
  size: 3.5,
  maxRating: 5,
}

export default ReviewStars
