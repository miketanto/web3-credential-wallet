import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import Web3Utils from 'web3-utils'

import { SupportedChainId } from '../constants/chains'
import { IS_IN_IFRAME } from '../constants/misc'
import { gnosisSafeConnector, injectedConnector } from '../utils/connectors'
import { isMobile } from '../utils/userAgent'
import { allTokens, NATIVE_TOKEN } from '../constants/tokens'

/**
 * Adds the iBlock chain to MetaMask wallet
 * @return {Promise<any>}
 */
async function addChainToMetaMask() {
  if (!window.ethereum || !window.ethereum.request) return null
  return window.request({
    method: 'wallet_addEthereumChain',
    params: [{
      blockExplorerUrls: ['https://iblockcore.com'],
      chainId: Web3Utils.toHex(SupportedChainId.MAINNET),
      chainName: 'iBlock',
      nativeCurrency: {
        name: NATIVE_TOKEN.name,
        symbol: NATIVE_TOKEN.symbol,
        decimals: NATIVE_TOKEN.decimals,
      },
      rpcUrls: ['https://chain.iblockcore.com'],
    }],
  })
}

/**
 * Adds tokens to MetaMask wallet
 * @param {Token[]} tokens
 * @return {Promise<any>}
 */
async function addTokensToMetaMask(tokens) {
  if (!window.ethereum || !window.ethereum.request || !tokens.length) return null
  const params = tokens.map((token) => ({
    type: 'ERC20', // From MetaMask's EIP-747: "In the future, other standards will be supported"
    options: {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      // image: getTokenLogoURL(token.address),
    },
  }))
  console.log(params)
  return window.ethereum.request({
    method: 'wallet_watchAsset',
    params: params[0],
  })
}

/**
 * @param ethereum MetaMask's window.ethereum
 * @param {number} [_i=0]
 */
export async function switchChainForMetaMask(_i = 0) {
  if (!window.ethereum || !window.ethereum.request || _i >= 2) return null
  try {
    return await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: Web3Utils.toHex(SupportedChainId.MAINNET) }],
    })
  } catch (switchError) {
    // Code 4902 indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await addChainToMetaMask()
        await switchChainForMetaMask(_i++)
      } catch (addError) {
        // handle "add" chain error
        return null
      }
    }
    // handle other "switch" chain errors
    return null
  }
}

/**
 * Eager Connect is used to automatically connect to wallet if the user authorized it previously
 *  so that the wallet-related functionalities can work without manually connecting again.
 * @return {boolean}
 */
export function useEagerConnect() {
  const { activate, active } = useWeb3React()
  const [tried, setTried] = useState(false)

  // gnosisSafe.isSafeApp() races a timeout against postMessage, so it delays pageload if we are not in a safe app;
  // if we are not embedded in an iframe, it is not worth checking
  const [triedSafe, setTriedSafe] = useState(!IS_IN_IFRAME)

  // first, try connecting to a gnosis safe
  useEffect(() => {
    if (!triedSafe) {
      gnosisSafeConnector.isSafeApp().then((loadedInSafe) => {
        if (loadedInSafe) {
          activate(gnosisSafeConnector, undefined, true).catch(() => {
            setTriedSafe(true)
          })
        } else {
          setTriedSafe(true)
        }
      })
    }
  }, [activate, setTriedSafe, triedSafe])

  // then, if that fails, try connecting to an injected connector
  useEffect(() => {
    if (!active && triedSafe) {
      injectedConnector.isAuthorized().then((isAuthorized) => {
        if (isAuthorized) {
          activate(injectedConnector, undefined, true).catch(() => {
            setTried(true)
          })
        } else if (isMobile && window.ethereum) {
          activate(injectedConnector, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      })
    }
  }, [activate, active, triedSafe])

  // wait until we get confirmation of a connection to flip the flag & execute post-connection actions
  useEffect(() => {
    if (active) {
      setTried(true)
      // addTokensToMetaMask(allTokens)
    }
  }, [active])

  return tried
}

/**
 * For `network` and `injected` connectors. Logs user in & out after checking what network they are on.
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React()

  useEffect(() => {
    const { ethereum } = window

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injectedConnector, undefined, true).catch((error) => {
          console.error('Failed to activate after chain changed', error)
        })
      }

      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injectedConnector, undefined, true).catch((error) => {
            console.error('Failed to activate after accounts changed', error)
          })
        }
      }

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
    return undefined
  }, [active, error, suppress, activate])
}
