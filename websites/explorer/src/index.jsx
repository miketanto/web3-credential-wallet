import { MsalProvider } from '@azure/msal-react'
import { PublicClientApplication } from '@azure/msal-browser'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import TagManager from 'react-gtm-module'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import './styles/index.css' // TailwindCSS

import { msalConfig } from './configs/azure/auth-config'
import { NetworkContextName } from './constants/misc'
import BlockedList from './components/BlockedList'
import App from './pages/App'
import reportWebVitals from './reportWebVitals'
import { persistor, store } from './states-new'
import ApplicationUpdater from './states-new/application/updater'
import TransactionUpdater from './states-new/transactions/updater'
import UserUpdater from './states-new/user/updater'
import WalletUpdater from './states-new/wallet/updater'
import getLibrary from './utils/getLibrary'
// import MultiCallUpdater from './states-new/call/updater'

const tagManagerArgs = {
  gtmId: 'GTM-W3TZ4M9',
}

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

/**
 * MSAL should be instantiated outside of the component tree to prevent it from being re-instantiated on re-renders.
 * For more, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
const msalInstance = new PublicClientApplication(msalConfig)

// Initialize Google Tag Manager
TagManager.initialize(tagManagerArgs)

// Kickstart updaters
function Updaters() {
  return (
    <>
      <ApplicationUpdater />
      <TransactionUpdater />
      <UserUpdater />
      <WalletUpdater />
      {/* <RadialGradientByChainUpdater /> */}
      {/* <ListsUpdater /> */}
      {/* <LogsUpdater /> */}
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter basename="/">
          <MsalProvider instance={msalInstance}>
            <Web3ReactProvider getLibrary={getLibrary}>
              <Web3ProviderNetwork getLibrary={getLibrary}>
                <BlockedList>
                  <Updaters />
                  <App />
                </BlockedList>
              </Web3ProviderNetwork>
            </Web3ReactProvider>
          </MsalProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
if (process.env.NODE_ENV === 'development') {
  reportWebVitals()
}
