import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import useActiveAADAccount from '../../hooks/useActiveAADAccount'

export default function MySkills() {
  const { account, isAccountLoading } = useActiveAADAccount()
  if (!isAccountLoading && !account) {
    return (<Navigate to="/" replace />)
  }
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <Outlet />
    </>
  )
}
