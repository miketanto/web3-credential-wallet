import { AccountInfo, InteractionStatus } from '@azure/msal-browser'
import { useMsal } from '@azure/msal-react'
import React, { useEffect, useState } from 'react'

import AzureAuthenticationButton from '../../components/AzureAuthenticationButton'
import Container from '../../components/Container'
import useActiveAADAccount from '../../hooks/useActiveAADAccount'

// Render JSON data in readable format
function PrettyPrintJson({ data }: { data: AccountInfo }) {
  const { instance, accounts, inProgress } = useMsal()
  const [accessToken, setAccessToken] = useState<string>()

  const request = {
    scopes: ['User.Read'],
    account: accounts[0],
  }

  useEffect(() => {
    // Silently acquires an access token which is then attached to a request for Microsoft Graph data
    instance.acquireTokenSilent(request)
      .then((res) => {
        setAccessToken(res.accessToken)
      })
      .catch((e) => {
        instance.acquireTokenPopup(request).then((res) => {
          setAccessToken(res.accessToken)
        })
      })
  }, [])

  return (
    <div>
      <pre>{accessToken}</pre>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

// Quick link - user revokes app's permission
function ShowPermissionRevokeLinks() {
  return (
    <div>
      <div><a href="https://myapps.microsoft.com" target="_blank" rel="noopener noreferrer">Revoke AAD permission</a></div>
      <div><a href="https://account.live.com/consent/manage" target="_blank" rel="noopener noreferrer">Revoke Consumer permission</a></div>
    </div>
  )
}

export default function SignIn() {
  // current authenticated user
  const { account, isAccountLoading } = useActiveAADAccount()

  // authentication callback
  const onAuthenticated = async (userAccountInfo: AccountInfo) => {
    // setCurrentUser(userAccountInfo)
  }

  return (
    <Container className="pt-10">
      <div className="text-2xl text-center font-semibold">
        Authentication Portal
      </div>
      <div className="mt-8 p-4 bg-white rounded-lg shadow-xl">
        <div>
          <AzureAuthenticationButton onAuthenticated={onAuthenticated} />
        </div>
        {account && (
          <div className="pt-8 text-xs">
            <PrettyPrintJson data={account} />
            {/* <ShowPermissionRevokeLinks /> */}
          </div>
        )}
      </div>
    </Container>
  )
}
