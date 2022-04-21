import { UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import clsx from 'clsx'
import { utils as ethUtils, Contract } from 'ethers'
import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useSelector } from 'react-redux'
import { useInput } from 'rooks'
import useSWR, { SWRConfig } from 'swr'

import Box from '../../components/Box'
import { injectedConnector, walletConnectConnector } from '../../utils/connectors'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { NATIVE_TOKEN, ALMA } from '../../constants/tokens'
import { CHAIN_INFO, SupportedChainId } from '../../constants/chains'
import Pill from '../../components/Pill'
import useAddTokenToMetamask from '../../hooks/useAddTokenToMetaMask'

const connectorsByName = {
  MetaMask: injectedConnector,
  WalletConnect: walletConnectConnector,
}

/**
 *
 * @param {Web3Provider} library
 * @param {Any} abi
 * @returns {(function(...[*]): (*))|*}
 */
const fetcher = (library, abi) => (...args) => {
  const [arg1, arg2, ...params] = args
  // it's a contract
  if (ethUtils.isAddress(arg1)) {
    const address = arg1
    const method = arg2
    const contract = new Contract(address, abi, library.getSigner())
    return contract[method](...params)
  }
  // it's a eth call
  const method = arg1
  return library[method](arg2, ...params)
}

function getErrorMessage(error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  } if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network."
  } if (
    error instanceof UserRejectedRequestErrorInjected
    || error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return 'Please authorize this website to access your Ethereum account.'
  }
  console.error(error)
  return 'An unknown error occurred. Check the console for more details.'
}

// function EthBalance() {
//   const { account, library } = useActiveWeb3React()
//   const { data: balance, mutate } = useSWR(['getBalance', account, 'latest'])
//
//   useEffect(() => {
//     // listen for changes on an Ethereum address
//     console.log('listening for blocks...')
//     library.on('block', () => {
//       console.log('update balance...')
//       mutate(undefined, true)
//     })
//
//     // remove listener when the component is unmounted
//     return () => library.removeAllListeners('block')
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [library])
//
//   if (!balance) {
//     return <div>...</div>
//   }
//   return (
//     <div>
//       {parseFloat(ethUtils.formatEther(balance)).toPrecision(4)}
//       {' '}
//       MCO
//     </div>
//   )
// }

// eslint-disable-next-line react/prop-types
function Spinner({ color, ...rest }) {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke={color} {...rest}>
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)" strokeWidth="2">
          <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </g>
    </svg>
  )
}

export default function Wallet() {
  const {
    connector, library, account, activate, deactivate, active, error, chainId,
  } = useActiveWeb3React()
  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already

  // TODO: remove useEagerConnect() here since Web3ReactManager calls it at root level
  const [activatingConnector, setActivatingConnector] = useState()

  // const userNativeBalance = useNativeCurrencyBalance(account ?? '')
  const userBalances = useSelector((state) => state.wallet.balances)
  const { addTokenALMA, addTokenALMAsuccess } = useAddTokenToMetamask(ALMA)
  // const { addTokenGCO, addTokenGCOsuccess } = useAddTokenToMetamask(GCO)

  return (
    <>
      <Helmet>
        <title>Wallet - iBlock by DLab</title>
      </Helmet>

      <Box className="border-illini-orange-100 w-full max-w-sm sm:max-w-md md:max-w-lg space-y-4" rounded="2xl">
        {/* <section className="p-4"> */}
        {/*  /!* eslint-disable-next-line no-nested-ternary *!/ */}
        {/*  /!* <h1 className="mb-4 text-right">{active ? '🟢' : error ? '🔴' : '🟠'}</h1> *!/ */}
        {/*  <section className="max-w-sm m-auto grid gap-4 leading-8" style={{ gridTemplateColumns: '1fr min-content 1fr' }}> */}
        {/*    /!* <ChainId /> *!/ */}
        {/*    /!* <BlockNumber /> *!/ */}
        {/*    /!* <Account /> *!/ */}
        {/*    /!* <Balance /> *!/ */}
        {/*    <Account /> */}
        {/*  </section> */}
        {/* </section> */}
        <div>
          <div className="text-teal-500 font-semibold">Account address</div>
          {
                account && (
                  <Pill
                    background="cloud"
                    color="industrial"
                    className="inline-block mt-2 py-1 px-4"
                    rounded="sm"
                    text={account}
                  />
                )
              }
        </div>
        <div>
          <div className="text-indigo-500 font-semibold">Account balance</div>
          {
                account && userBalances && (
                  <Pill
                    background="cloud"
                    color="industrial"
                    className="inline-block mt-2 py-1 px-4"
                    rounded="sm"
                    text={`${userBalances[NATIVE_TOKEN.symbol] ?? 0} ${NATIVE_TOKEN.symbol}`}
                  />
                )
              }
        </div>
      </Box>

      <Box className="border-illini-orange-100 w-full max-w-sm sm:max-w-md md:max-w-lg space-y-4" rounded="2xl">
        <div>
          <button type="button" onClick={addTokenALMA}>
            <Pill className="border border-illini-orange/20 hover:bg-illini-orange/10 transition">
              Add ALMA
            </Pill>
            {
                  addTokenALMAsuccess ? (
                    <div>Added ALMA!</div>
                  ) : <div>Manually add ALMA to your wallet</div>
                }
          </button>
        </div>
        <div>
          {/* <button type="button" onClick={addTokenGCO}> */}
          {/*  <Pill className="border border-illini-orange/20 hover:bg-illini-orange/10 transition"> */}
          {/*    Add GCO */}
          {/*  </Pill> */}
          {/*  { */}
          {/*    addTokenGCOsuccess ? ( */}
          {/*      <div>Added GCO!</div> */}
          {/*    ) : <div>Manually add GCO to your wallet</div> */}
          {/*  } */}
          {/* </button> */}
        </div>
      </Box>

      <Box className="border-illini-orange-100 w-full max-w-sm sm:max-w-md md:max-w-lg space-y-4" rounded="2xl">
        <div>
          {Object.keys(connectorsByName).map((name) => {
            const currentConnector = connectorsByName[name]
            const activating = currentConnector === activatingConnector
            const connected = currentConnector === connector
            const disabled = !!activatingConnector || connected || !!error

            return (
              <button
                type="button"
                className={
                      clsx(
                        'relative py-3 px-4 border rounded-2xl hover:shadow-lg',
                        activating && 'text-orange-500 border-orange-500',
                        !activating && (connected ? 'text-green-500 border-green-500 hover:shadow-none' : 'text-inherit border-inherit'),
                        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                      )
                    }
                disabled={disabled}
                key={name}
                onClick={() => {
                  setActivatingConnector(currentConnector)
                  activate(connectorsByName[name])
                }}
              >
                <div className="flex absolute h-full top-0 left-0 m-0 ml-4 items-center text-black">
                  {activating && <Spinner color="black" style={{ height: '25%', marginLeft: '-1rem' }} />}
                  {connected && <span role="img" aria-label="check">✅</span>}
                </div>
                {name}
              </button>
            )
          })}
        </div>

        <div className="pb-6 flex flex-col items-center">
          {(active || error) && (
          <button
            type="button"
            className="mt-8 py-3 px-4 border border-red-500 rounded-2xl cursor-pointer hover:shadow-lg"
            onClick={() => deactivate()}
          >
            Deactivate
          </button>
          )}

          {!!error && <h4 className="mt-4 mb-0">{getErrorMessage(error)}</h4>}
        </div>
      </Box>
    </>
  )
}
