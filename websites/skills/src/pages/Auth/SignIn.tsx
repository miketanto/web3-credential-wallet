import { useAuth0 } from '@auth0/auth0-react'
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

function LoginButton() {
  const { loginWithRedirect } = useAuth0()
  return <button type="button" onClick={() => loginWithRedirect()}>Log In</button>
}

function LogoutButton() {
  const { logout } = useAuth0()
  return <button type="button" onClick={() => logout({ returnTo: window.location.origin })}>Log Out</button>
}

export default function SignIn() {
  const {
    user, isAuthenticated, isLoading, getAccessTokenSilently,
  } = useAuth0()
  const [userMetadata, setUserMetadata] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) return
    const getUserMetadata = async () => {
      const domain = 'dev-qdoaepgh.us.auth0.com'

      try {
        const accessToken = await getAccessTokenSilently({
          audience: `https://${domain}/api/v2/`,
          scope: 'read:current_user',
        })

        const userDetailsByIdUrl = `https://${domain}/api/v2/users/${user?.sub}`

        const metadataResponse = await fetch(userDetailsByIdUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        const { user_metadata } = await metadataResponse.json()

        setUserMetadata(user_metadata)
      } catch (err) {
        console.error(err)
      }
    }

    getUserMetadata()
  }, [getAccessTokenSilently, user?.sub])

  if (isLoading) {
    return <div>Loading ...</div>
  }

  return (
    <Container className="pt-10">
      <div className="text-2xl text-center font-semibold">
        Authentication Portal
      </div>
      <div className="mt-8 p-4 bg-white rounded-lg shadow-xl">
        <div>
          {/* <AzureAuthenticationButton onAuthenticated={onAuthenticated} /> */}
          {!isAuthenticated && <LoginButton />}
          {isAuthenticated && <LogoutButton />}
        </div>
        {isAuthenticated && (
          <div className="pt-8 text-xs">
            {/* <PrettyPrintJson data={account} /> */}
            {/* <ShowPermissionRevokeLinks /> */}
            <img src={user?.picture} alt={user?.name} />
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <h3>User Metadata</h3>
            {userMetadata ? (
              <pre>{JSON.stringify(userMetadata, null, 2)}</pre>
            ) : (
              'No user metadata defined'
            )}
          </div>
        )}
      </div>
    </Container>
  )
}
