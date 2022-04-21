import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import useActiveAADAccount from '../../hooks/useActiveAADAccount'

export default function Account() {
  const { account, isAccountLoading } = useActiveAADAccount()

  if (isAccountLoading) return <div>Loading...</div>

  // Account is done loading

  // NOT signed in (account is undefined)
  if (!account) return <Navigate replace to="/auth" />

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <Outlet />
    </>
  )
}
