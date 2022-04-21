import React from 'react'
import { Outlet } from 'react-router-dom'

export default function Auth() {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <Outlet />
    </>
  )
}
