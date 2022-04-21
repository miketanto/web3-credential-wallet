import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser'

import { msalConfig } from '../configs/azure/auth-config'

export interface SignOutRequest {
  account: AccountInfo | null,
  extraQueryParameters: { domain_hint: 'illinois.edu' }, // auto select based on domain
  loginHint: string | null,
  sid: 1,
  postLogoutRedirectUri: string,
}

/**
 * Returns Logout request parameters for MSAL
 * @param {IPublicClientApplication} instance
 * @return {SignOutRequest}
 */
export default function getSignOutRequest(instance: IPublicClientApplication): SignOutRequest {
  // const account = instance.getAccountByHomeId(msalConfig.auth.clientId)
  const account = instance.getAllAccounts()[0] || instance.getAccountByHomeId(msalConfig.auth.clientId)
  const loginHint = account.username
  // TODO: Fix auto select - not working
  return {
    account,
    extraQueryParameters: { domain_hint: 'illinois.edu' }, // auto select based on domain
    loginHint,
    sid: 1,
    postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri,
  }
}
