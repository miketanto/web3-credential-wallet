import { AccountInfo, InteractionStatus } from '@azure/msal-browser'
import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import { useEffect, useState } from 'react'


/**
 * Provides account (AccountInfo) if user is signed in. Otherwise account is undefined.
 * NOTE that one must check `isAccountLoading` and make sure it's FALSE before checking the account itself.
 * Reason: AAD initially sends a call to get AAD user info, and then provides the account data if the user
 * is signed in. So this hook returns `undefined` during that time, and then `AccountInfo` after the call fetches.
 */
export default function useActiveAADAccount() {
  const { inProgress, instance } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const [account, setAccount] = useState(undefined)
  const [isAccountLoading, setAccountIsLoading] = useState(true)

  useEffect(() => {
    if (inProgress !== InteractionStatus.Startup && isAccountLoading) {
      setAccountIsLoading(false)
    }

    if (isAuthenticated && inProgress === InteractionStatus.None) {
      setAccount(instance.getActiveAccount() || undefined)
    }
  }, [isAuthenticated, inProgress, instance])

  return { account, isAccountLoading }
}