import { useWeb3React } from '@web3-react/core'
import React, { useEffect } from 'react'

import { networkConnector } from '../../utils/connectors'
import { NetworkContextName } from '../../constants/misc'
import { useEagerConnect, useInactiveListener } from '../../hooks/web3'

/**
 * Takes care of eager connection & inactive listening
 * @param children
 * @return {JSX.Element|*}
 * @constructor
 */
export default function Web3ReactManager({ children }: { children: JSX.Element | JSX.Element[] }): JSX.Element {
  const { active } = useWeb3React()
  const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React(NetworkContextName)

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
  useEffect(() => {
    if (triedEager && !networkActive && !networkError && !active) {
      activateNetwork(networkConnector)
    }
  }, [triedEager, networkActive, networkError, activateNetwork, active])

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager)

  // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  if (triedEager && !active && networkError) {
    return (
      <div>
        Oops! An unknown error occurred. Please refresh the page, or visit from another browser or device.
      </div>
    )
  }

  // Must wrap around <></> to return as React Element
  return (
    <>
      {children}
    </>
  )
}
