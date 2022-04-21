import clsx from 'clsx'
import PropTypes from 'prop-types'
import React from 'react'

function Container({
  children, className, flexRow, noFlex, size,
}) {
  let flexClass, flexStyleClass
  if (!noFlex) {
    // Flex class should use default justify-center & items-stretch IFF optional `className` doesn't include them.
    // Otherwise, override with className (adding both classes to override produces weird behavior)
    flexClass = clsx('flex', !className.includes('justify-') && 'justify-center', !className.includes('items-') && 'items-stretch')
    flexStyleClass = flexRow ? 'flex-row' : 'flex-col'
  }
  // eslint-disable-next-line no-nested-ternary
  const sizeClass = size === 'lg' ? 'max-w-6xl xl:max-w-8xl' : size === 'md' ? 'max-w-4xl xl:max-w-6xl' : 'max-w-3xl xl:max-w-5xl'
  return (
    <section className={clsx('m-auto my-10 px-4 text-sm sm:text-md z-40', flexClass, flexStyleClass, sizeClass, className)}>
      {children}
    </section>
  )
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  flexRow: PropTypes.bool,
  noFlex: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
}

Container.defaultProps = {
  className: '',
  flexRow: false,
  noFlex: false,
  size: 'lg',
}

export default Container
