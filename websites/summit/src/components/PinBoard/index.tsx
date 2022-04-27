import clsx from 'clsx'
import React, { ReactNode } from 'react'

interface PinBoardParams {
  children: ReactNode | ReactNode[],
  className?: string,
}

export default function PinBoard({
  children, className = '',
}: PinBoardParams) {
  return (
    <div
      className={clsx(
        'w-full bg-white border border-stone-200 rounded-lg',
        className,
      )}
    >
      {children}
    </div>
  )
}
