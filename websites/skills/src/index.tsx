import { Auth0Provider } from '@auth0/auth0-react'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import React from 'react'
import ReactDOM from 'react-dom'
import { HelmetProvider } from 'react-helmet-async'
import TagManager from 'react-gtm-module'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import './styles/index.css'

import { MSAL_CONFIG } from './config/azure-auth'
import App from './pages/App'
import { persistor, store } from './states'
import reportWebVitals from './utils/reportWebVitals'

// function Updaters() {
//   return (
//     <>
//       <ApplicationUpdater />
//       <TransactionUpdater />
//       <UserUpdater />
//       <WalletUpdater />
//       {/* <RadialGradientByChainUpdater /> */}
//       {/* <ListsUpdater /> */}
//       {/* <LogsUpdater /> */}
//     </>
//   )
// }

// Initialize Google Tag Manager
// TagManager.initialize(tagManagerArgs)

// Initialize PCA for AAD
const pca = new PublicClientApplication(MSAL_CONFIG)

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Auth0Provider
          domain="dev-qdoaepgh.us.auth0.com"
          clientId="ATIWCOwYIsDrBcsdqAiBq3V03sUhd7aN"
          redirectUri={window.location.origin}
          audience="https://dev-qdoaepgh.us.auth0.com/api/v2/"
          scope="read:current_user update:current_user_metadata"
        >
          <BrowserRouter basename="/">
            {/* <Updaters /> */}
            <HelmetProvider>
              <App />
            </HelmetProvider>
          </BrowserRouter>
        </Auth0Provider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
