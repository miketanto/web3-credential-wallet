import clsx from 'clsx'
import React, { ReactNode } from 'react'

interface PinBoardBodyParams {
  children: ReactNode | ReactNode[],
  className?: string,
}

export default function PinBoardBody({
  children, className = '',
}: PinBoardBodyParams) {
  return (
    <div
      className={clsx(
        'flex flex-row space-y-2 py-4 px-6',
        className,
      )}
    >
      {children}
    </div>
  )
}
