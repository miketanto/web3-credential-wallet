import { Auth0Provider } from '@auth0/auth0-react'
import React from 'react'
import ReactDOM from 'react-dom'
import { HelmetProvider } from 'react-helmet-async'
import TagManager from 'react-gtm-module'
import { BrowserRouter } from 'react-router-dom'

import './styles/index.css'

import App from './pages/App'
import reportWebVitals from './utils/reportWebVitals'

// Initialize Google Tag Manager
// TagManager.initialize(tagManagerArgs)

ReactDOM.render(
  <React.StrictMode>
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
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
