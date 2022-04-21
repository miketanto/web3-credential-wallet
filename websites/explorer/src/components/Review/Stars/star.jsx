import React from 'react'
import PropTypes from 'prop-types'

import classNames from '../../../utils/classNames'

function Star({
  size, colorFilled, colorUnfilled, isFilled,
}) {
  const classes = classNames(`w-${size} h-${size} fill-current text-${isFilled ? colorFilled : colorUnfilled}`)
  return (
    <svg className={classes} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
    </svg>
  )
}

Star.propTypes = {
  size: PropTypes.number,
  isFilled: PropTypes.bool.isRequired,
  colorFilled: PropTypes.string,
  colorUnfilled: PropTypes.string,
}

Star.defaultProps = {
  size: 3.5,
  colorFilled: 'yellow-500',
  colorUnfilled: 'gray-400',
}

export default Star
