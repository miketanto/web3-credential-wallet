import {
  AuthenticationResult,
  AccountInfo,
  EndSessionRequest,
  RedirectRequest,
  PopupRequest,
  IPublicClientApplication,
} from '@azure/msal-browser'

import { MSAL_CONFIG } from './azure-auth'

export class AzureAuthenticationContext {
  private aadMSALObj: IPublicClientApplication // = new PublicClientApplication(MSAL_CONFIG)

  private account?: AccountInfo

  private loginRedirectRequest?: RedirectRequest

  private loginRequest?: PopupRequest

  public isAuthenticationConfigured = false

  constructor(instance: IPublicClientApplication) {
    this.aadMSALObj = instance

    this.account = undefined
    this.setRequestObjects()
    if (MSAL_CONFIG?.auth?.clientId) this.isAuthenticationConfigured = true

    // this.aadMSALObj.addEventCallback((event) => {
    //   // set active account after popup/redirect
    //   if (event.error) return console.error(event.error)
    //   if (event.eventType === EventType.LOGIN_SUCCESS && isAccountInfo(event.payload)) {
    //     this.aadMSALObj.setActiveAccount(event.payload)
    //   }
    // })

    // this.aadMSALObj.handleRedirectPromise().then((authResult) => {
    //   // Check if user signed in
    //   const account = this.aadMSALObj.getActiveAccount()
    //   if (account) this.account = account
    //   if (!account) {
    //     // redirect anonymous user to login page
    //     this.aadMSALObj.loginRedirect()
    //   }
    // }).catch((err) => {
    //   // TODO: Handle errors
    //   console.log(err)
    // })
  }

  private setRequestObjects(): void {
    this.loginRequest = {
      scopes: [],
      prompt: 'select_account',
    }

    this.loginRedirectRequest = {
      ...this.loginRequest,
      redirectStartPage: window.location.href,
    }
  }

  login(signInType: string, setUser: (account: AccountInfo) => void): void {
    if (signInType === 'loginPopup') {
      this.aadMSALObj
        .loginPopup(this.loginRequest)
        .then((resp: AuthenticationResult) => {
          this.handleResponse(resp, setUser)
        })
        .catch((err) => {
          console.error(err)
        })
    } else if (signInType === 'loginRedirect') {
      this.aadMSALObj.loginRedirect(this.loginRedirectRequest)
    }
  }

  logout(account: AccountInfo): Promise<void> {
    const logOutRequest: EndSessionRequest = { account }
    return this.aadMSALObj.logoutPopup(logOutRequest)
  }

  handleResponse(response: AuthenticationResult, incomingFunction: (account: AccountInfo) => void) {
    this.account = response?.account || this.getAccount()
    if (this.account) {
      this.aadMSALObj.setActiveAccount(this.account)
      incomingFunction(this.account)
    }
  }

  private getAccount(): AccountInfo | undefined {
    // console.log('loadAuthModule')
    const currentAccounts = this.aadMSALObj.getAllAccounts()
    if (currentAccounts === null) {
      console.log('No accounts detected')
      return undefined
    }

    if (currentAccounts.length > 1) {
      // TBD: Add choose account code here
      console.log('Multiple accounts detected, need to add choose account code.')
      return currentAccounts[0]
    } if (currentAccounts.length === 1) {
      return currentAccounts[0]
    }
    return undefined
  }
}

export default AzureAuthenticationContext
