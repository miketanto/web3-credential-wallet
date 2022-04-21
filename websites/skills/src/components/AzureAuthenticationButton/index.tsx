import { AccountInfo } from '@azure/msal-browser'
import { useMsal } from '@azure/msal-react'
import React, { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import AzureAuthenticationContext from '../../config/azure-context'
import useActiveAADAccount from '../../hooks/useActiveAADAccount'

// Check for IE, do loginRedirect if so. FOR NOW, ignore IE & do loginPopup for all
// const ua = window.navigator.userAgent
// const msie = ua.indexOf('MSIE ')
// const msie11 = ua.indexOf('Trident/')
// const isIE = msie > 0 || msie11 > 0

interface AADButtonParams {
  onAuthenticated(user: AccountInfo | undefined): void, // void arrow function
}

// Log In, Log Out button
function AzureAuthenticationButton({ onAuthenticated }: AADButtonParams): JSX.Element {
  const { account, isAccountLoading } = useActiveAADAccount()
  const { instance } = useMsal()
  const authenticationModule: AzureAuthenticationContext = new AzureAuthenticationContext(instance)

  // const {login, result, error} = useMsalAuthentication("popup");

  const location = useLocation()
  const navigate = useNavigate()

  const signIn = (method: string | undefined): void => {
    // const typeName = 'loginPopup'
    // const logInType = isIE ? 'loginRedirect' : typeName
    const logInType = method || 'loginPopup' // popup works well with React SPA, redirect doesn't

    // Azure Login
    authenticationModule.login(logInType, returnedAccountInfo)
  }

  const signOut = (): void => {
    if (account) {
      onAuthenticated(undefined)
      // Azure Logout
      authenticationModule
        .logout(account)
        .then(() => navigate(location.pathname))
    }
  }

  const returnedAccountInfo = (userAccount: AccountInfo) => {
    onAuthenticated(userAccount)
  }

  const showLogInButton = (): ReactNode => (
    <button
      type="button"
      className="py-2 px-4 text-white bg-illini-blue text-lg font-semibold rounded-lg shadow-xl"
      onClick={() => signIn('loginPopup')}
    >
      Sign in
    </button>
  )

  const showLogOutButton = (): ReactNode => (
    <button
      type="button"
      className="py-2 px-4 text-white bg-illini-orange text-lg font-semibold rounded-lg shadow-xl"
      onClick={() => signOut()}
    >
      Sign out
    </button>
  )

  // TODO: check expiry date for REHYDRATED redux account
  const showButton = (): ReactNode => (account ? showLogOutButton() : showLogInButton())

  return (
    <div>
      {authenticationModule.isAuthenticationConfigured ? (
        showButton()
      ) : (
        <div>Authentication Client ID is not configured.</div>
      )}
    </div>
  )
}

export default AzureAuthenticationButton
