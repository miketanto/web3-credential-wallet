import { AccountInfo, InteractionStatus } from '@azure/msal-browser'
import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { useEffect, useState } from 'react'

interface CustomAccountInfo extends AccountInfo {
  firstName: string,
  lastName: string,
}

interface ActiveAADAccount {
  account: CustomAccountInfo | undefined,
  isAccountLoading: boolean,
}

/**
 * Provides account (AccountInfo) if user is signed in. Otherwise account is undefined.
 * NOTE that one must check `isAccountLoading` and make sure it's FALSE before checking the account itself.
 * Reason: AAD initially sends a call to get AAD user info, and then provides the account data if the user
 * is signed in. So this hook returns `undefined` during that time, and then `AccountInfo` after the call fetches.
 */
export default function useActiveAADAccount(): ActiveAADAccount {
  const { inProgress, instance } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const [account, setAccount] = useState<CustomAccountInfo | undefined>(undefined)
  const [isAccountLoading, setAccountIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (inProgress !== InteractionStatus.Startup && isAccountLoading) {
      setAccountIsLoading(false)
    }

    if (isAuthenticated && inProgress === InteractionStatus.None) {
      const activeAccount = instance.getActiveAccount() as CustomAccountInfo || undefined
      if (activeAccount && activeAccount.name) {
        [activeAccount.lastName, activeAccount.firstName] = activeAccount.name.split(',').map((x) => x.trim())
      }
      setAccount(activeAccount)
    }
  }, [isAuthenticated, inProgress, instance])

  return { account, isAccountLoading }
}
