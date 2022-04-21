import { Configuration, LogLevel } from '@azure/msal-browser'

import { AADClientId, AADTenantId } from './env-vars'

export const MSAL_CONFIG: Configuration = {
  auth: {
    authority: `https://login.microsoftonline.com/${AADTenantId as string}`,
    clientId: AADClientId as string,
  },
  cache: {
    // By default, MSAL.js uses sessionStorage, which doesn't allow the session to be shared between tabs.
    // To get SSO between tabs, make sure to set the cacheLocation in MSAL.js to localStorage.
    cacheLocation: 'localStorage', // 'sessionStorage'
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            return
          case LogLevel.Info:
            console.info(message)
            return
          case LogLevel.Verbose:
            console.debug(message)
            return
          case LogLevel.Warning:
            console.warn(message)
        }
      },
    },
  },
}
