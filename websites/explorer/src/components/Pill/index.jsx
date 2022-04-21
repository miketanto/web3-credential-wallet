import clsx from 'clsx'
import PropTypes from 'prop-types'
import React from 'react'

function Pill({
  background, children, clickable, color, className, dropShadow, hoverBackground, hoverColor, rounded, shadow, size, text,
}) {
  /* eslint-disable no-nested-ternary */
  // For rounded, inherit `rounded-X` from Tailwind with extra options: `normal` - just `rounded`
  const roundClass = rounded === 'sm' ? 'rounded' : `rounded-${rounded}`
  const sizeClass = size === 'lg' ? 'py-3 px-4' : size === 'md' ? 'py-2 px-3' : 'py-1 px-2'
  /* eslint-enable no-nested-ternary */
  const classNames = clsx(
    `text-${color}`,
    `bg-${background}`,
    hoverColor && `hover:text-${hoverColor}`,
    hoverBackground && `hover:bg-${hoverBackground}`,
    (hoverColor || hoverBackground) && 'transition',
    roundClass,
    sizeClass,
    shadow && 'shadow',
    dropShadow && 'drop-shadow',
    clickable && 'cursor-pointer',
    className,
  )

  if (children) return <div className={classNames}>{children}</div>
  return <div className={classNames}>{text}</div>
}

Pill.propTypes = {
  background: PropTypes.string,
  children: PropTypes.node,
  clickable: PropTypes.bool,
  className: PropTypes.string,
  color: PropTypes.string,
  dropShadow: PropTypes.bool,
  hoverBackground: PropTypes.string,
  hoverColor: PropTypes.string,
  rounded: PropTypes.oneOf(['sm', 'md', 'lg', 'full']),
  shadow: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  text: PropTypes.string,
}

Pill.defaultProps = {
  background: 'white',
  children: null,
  clickable: false,
  className: '',
  color: 'black',
  dropShadow: false,
  hoverBackground: '',
  hoverColor: '',
  rounded: 'full',
  shadow: false,
  size: 'md',
  text: '',
}

export default Pill
