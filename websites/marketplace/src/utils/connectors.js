import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

import {currentChainUrl, currentChainId} from './chainConst'

/**
 * 1515 is iBlock Core's chain id
 * 1337 is Hardhat local dev
 */

export const injectedConnector = new InjectedConnector({ supportedChainIds: [1515,1337] })

export const networkConnector = new NetworkConnector({
  urls: { 1515: process.env.REACT_APP_WEB3_URL},
// 1337:'http://127.0.0.1:7545'},
  defaultChainId: 1515,
})

export const gnosisSafeConnector = new SafeAppConnector()

export const walletConnectConnector = new WalletConnectConnector({
  rpc: { 1: process.env.REACT_APP_WEB3_URL  },
  qrcode: true,
})
