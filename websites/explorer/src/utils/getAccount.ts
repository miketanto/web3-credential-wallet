import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser'

export interface AccountData {
  account: AccountInfo | null,
  username: string | null,
  isAuthenticated: boolean,
}

/**
 * Returns MSAL account (if signed in)
 * @param {IPublicClientApplication} instance
 * @return {null|{isAuthenticated: boolean, account: AccountInfo, username}}
 */
export default function getAccount(instance: IPublicClientApplication): AccountData | null {
  const currentAccounts = instance.getAllAccounts()

  if (currentAccounts === null) {
    console.error('No accounts detected!')
    return null
  }

  if (currentAccounts.length > 1) console.warn('Multiple accounts detected.')

  // For now, select the first account
  return {
    account: instance.getAccountByUsername(currentAccounts[0].username),
    username: currentAccounts[0].username,
    isAuthenticated: true,
  }
}
