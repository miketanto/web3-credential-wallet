import { AccountInfo } from '@azure/msal-browser'
import { useMsal } from '@azure/msal-react'
import React, { ReactNode } from 'react'
import { useLocation, navigate } from "@reach/router";
import AzureAuthenticationContext from '../../configs/azure-context'
import useActiveAADAccount from '../../hooks/useAADAccount'

// Check for IE, do loginRedirect if so. FOR NOW, ignore IE & do loginPopup for all
// const ua = window.navigator.userAgent
// const msie = ua.indexOf('MSIE ')
// const msie11 = ua.indexOf('Trident/')
// const isIE = msie > 0 || msie11 > 0


// Log In, Log Out button
function AzureAuthenticationButton({ onAuthenticated }){
  const { account, isAccountLoading } = useActiveAADAccount()
  const { instance } = useMsal()
  const authenticationModule = new AzureAuthenticationContext(instance)

  // const {login, result, error} = useMsalAuthentication("popup");

  //const location = useLocation()

  const signIn = (method)=> {
    // const typeName = 'loginPopup'
    // const logInType = isIE ? 'loginRedirect' : typeName
    const logInType = method || 'loginPopup' // popup works well with React SPA, redirect doesn't

    // Azure Login
    authenticationModule.login(logInType, returnedAccountInfo)
  }

  const signOut = () => {
    if (account) {
      onAuthenticated(undefined)
      // Azure Logout
      authenticationModule
        .logout(account)
    }
  }

  const returnedAccountInfo = (userAccount) => {
    onAuthenticated(userAccount)
  }

  const showLogInButton = () => (
    <div  onClick={() => signIn('loginPopup')} className = 'connect'>
        Azure Login
    </div>
  )
 

  const showLogOutButton = ()=> (
    <div onClick={() => signOut()} className = 'connected'>
        <div>Sign Out</div>
    </div>
  )

  // TODO: check expiry date for REHYDRATED redux account
  const showButton = () => (account ? showLogOutButton() : showLogInButton())

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