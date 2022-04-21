import React from 'react'
import PropTypes from 'prop-types'

import ProductCard from '../Product'

import classNames from '../../../utils/classNames'

function ProductCards({ items, perRow, perRowMobile }) {
  const childClass = classNames(`min-w-${12 / perRowMobile}/12`, `sm:min-w-${12 / perRow}/12`, `max-w-${12 / perRowMobile}/12`, `sm:max-w-${12 / perRow}/12`)

  const children = items.map((item) => <ProductCard key={item.id} className={childClass} productInfo={item} />)

  // const modChildren = React.Children.map(children, (child) => React.cloneElement(child, { className: classNames(child.className, childClass) }))

  return (
    <div className="flex flex-columns flex-wrap justify-items-start p-2 sm:px-4">
      {children}
    </div>
  )
}

ProductCards.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  items: PropTypes.array.isRequired,
  perRow: PropTypes.number,
  perRowMobile: PropTypes.number,
}

ProductCards.defaultProps = {
  perRow: 4,
  perRowMobile: 2,
}

export default ProductCards
