import React from 'react'
import { Outlet } from 'react-router-dom'

export default function Inbox() {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <Outlet />
    </>
  )
}
