import React from 'react'

import Container from '../../components/Container'
import useActiveAADAccount from '../../hooks/useActiveAADAccount'

export default function AccountHome() {
  const { account, isAccountLoading } = useActiveAADAccount()

  return (
    <Container className="pt-10">
      <div className="text-2xl text-center font-semibold">
        Account Home
      </div>
      <div className="mt-8 p-4 bg-white rounded-lg shadow-xl">
        {account && !isAccountLoading && (
          <div className="pt-8 text-xs">
            <pre>{JSON.stringify(account, null, 2)}</pre>
          </div>
        )}
      </div>
    </Container>
  )
}
