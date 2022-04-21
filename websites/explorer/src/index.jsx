import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import TagManager from 'react-gtm-module'
import { BrowserRouter } from 'react-router-dom'

import './styles/index.css' // TailwindCSS

import App from './pages/App'
import reportWebVitals from './reportWebVitals'

const tagManagerArgs = {
  gtmId: 'GTM-W3TZ4M9',
}

// Initialize Google Tag Manager
TagManager.initialize(tagManagerArgs)

ReactDOM.render(
  <StrictMode>
    <BrowserRouter basename="/">
      <App />
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
if (process.env.NODE_ENV === 'development') {
  reportWebVitals()
}
