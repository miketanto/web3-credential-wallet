import clsx from 'clsx'
import React, { ReactNode } from 'react'

interface PinBoardHeaderParams {
  children: ReactNode | ReactNode[],
  className?: string,
}

export default function PinBoardHeader({
  children, className = '',
}: PinBoardHeaderParams) {
  return (
    <div
      className={clsx(
        'pt-4 px-6',
        className,
      )}
    >
      {children}
    </div>
  )
}
