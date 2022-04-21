import clsx from 'clsx'
import PropTypes from 'prop-types'
import React from 'react'

function Box({
  background, children, className, color, flexRow, noFlex, rounded, shadow, size,
}) {
  let flexClass, flexStyleClass
  const colorClass = `text-${color} bg-${background}`
  const shadowClass = shadow && 'shadow-cmd'
  const shapeClass = `rounded-${rounded}`
  // eslint-disable-next-line no-nested-ternary
  const sizeClass = size === 'lg' ? 'py-5 px-8' : size === 'md' ? 'py-3 px-6' : size === 'sm' ? 'py-2 px-4' : 'p-0' // minimal: no padding

  if (!noFlex) {
    // Flex class should use default justify-center & items-stretch IFF optional `className` doesn't include them.
    // Otherwise, override with className (adding both classes to override produces weird behavior)
    flexClass = clsx('flex', !className.includes('justify-') && 'justify-center', !className.includes('items-') && 'items-stretch')
    flexStyleClass = flexRow ? 'flex-row' : 'flex-col'
  }

  return (
    <div className={clsx('border border-gray-100', flexClass, flexStyleClass, colorClass, shapeClass, shadowClass, sizeClass, className)}>
      {children}
    </div>
  )
}

Box.propTypes = {
  background: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  color: PropTypes.string,
  flexRow: PropTypes.bool,
  noFlex: PropTypes.bool,
  rounded: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  shadow: PropTypes.bool,
  size: PropTypes.oneOf(['minimal', 'sm', 'md', 'lg']),
}

Box.defaultProps = {
  background: 'white',
  className: '',
  color: 'black',
  flexRow: false,
  noFlex: false,
  rounded: 'lg',
  shadow: false,
  size: 'md',
}

export default Box
