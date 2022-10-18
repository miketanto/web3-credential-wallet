import { Outlet } from 'react-router-dom'
import React from 'react'

export default function Gallery() {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <Outlet />
    </>
  )
}
