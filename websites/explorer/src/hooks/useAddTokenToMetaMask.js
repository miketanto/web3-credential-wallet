// Adapted from: https://github.com/Uniswap/interface/blob/main/src/hooks/useAddTokenToMetamask.ts

import { useCallback, useState } from 'react'

// import { getTokenLogoURL } from './../components/CurrencyLogo/index'
import { Token } from '../entities'
import useActiveWeb3React from './useActiveWeb3React'

/**
 * Add token to MetaMask
 * @param {Token|undefined} currencyToAdd
 * @return {{addToken: ((function(): void)|*), success: (boolean|undefined)}}
 */
export default function useAddTokenToMetamask(currencyToAdd) {
  const { library } = useActiveWeb3React()

  const token = currencyToAdd.wrapped

  const [success, setSuccess] = useState(false)

  const addToken = useCallback(() => {
    // if (library && library.provider.isMetaMask && library.provider.request && token) {
    // TODO: Use MetaMask's injected lib
    try {
      // if (library && library.provider.isMetaMask && library.provider.request && token) {
      //   library.provider
      //     .request({
      //       method: 'wallet_watchAsset',
      //       params: {
      //       // @ts-ignore // need this for incorrect ethers provider type
      //         type: 'ERC20',
      //         options: {
      //           address: token.address,
      //           symbol: token.symbol,
      //           decimals: token.decimals,
      //         // image: getTokenLogoURL(token.address),
      //         },
      //       },
      //     })
      //     .then((success) => setSuccess(success))
      //     .catch(() => setSuccess(false))
      // } else {
      //   setSuccess(false)
      // }
      if (window.ethereum && window.ethereum.request) {
        // console.log(window.ethereum)
        window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20', // Initially only supports ERC20, but eventually more!
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
              // image: getTokenLogoURL(token.address),
            },
          },
        })
          .then(() => setSuccess(true))
          .catch(() => setSuccess(false))
      } else {
        console.log('MetaMask is not connected!')
        setSuccess(false)
      }
    } catch (err) {
      console.log(err)
      setSuccess(false)
    }
  }, [library, token])

  return { addToken, success }
}
