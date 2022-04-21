import React from 'react';
import ReactDOM from 'react-dom';
import "./assets/animated.css";
import '../node_modules/font-awesome/css/font-awesome.min.css'; 
import '../node_modules/elegant-icons/style.css';
import '../node_modules/et-line/style.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.js';
import './assets/style.scss';
import { msalConfig } from './configs/azure/auth-config'
import './assets/style_grey.scss';
import App from './components/app';
import * as serviceWorker from './serviceWorker';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { NetworkContextName } from './constants/misc'
import { MsalProvider } from '@azure/msal-react'
import { PublicClientApplication } from '@azure/msal-browser'
import getLibrary from './utils/getLibrary'
//redux store
import { Provider } from 'react-redux'
import store from './store';
import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import AlertTemplate from 'react-alert-template-mui'

const options = {
	// you can also just use 'bottom center'
	position: positions.MIDDLE,
	timeout: 5000,
	offset: '30px',
	// you can also just use 'scale'
	transition: transitions.SCALE
  }

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

const msalInstance = new PublicClientApplication(msalConfig)

ReactDOM.render(

	<Provider store={store}>
		<MsalProvider instance={msalInstance}>
			<Web3ReactProvider getLibrary={getLibrary}>
					<Web3ProviderNetwork getLibrary={getLibrary}>
						<AlertProvider template={AlertTemplate} {...options}>
							<App />
						</AlertProvider>
					</Web3ProviderNetwork>
			</Web3ReactProvider>
		</MsalProvider>
	</Provider>, 
	document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();