import { BigNumber } from 'ethers' // for type

import { useSingleCallResult } from '../state/multicall/hooks'
import { useInterfaceMulticall } from './useContract'

/**
 * Gets the current timestamp from the blockchain
 * @return {BigNumber | undefined}
 */
export default function useCurrentBlockTimestamp() {
  const multicall = useInterfaceMulticall()
  return useSingleCallResult(multicall, 'getCurrentBlockTimestamp')?.result?.[0]
}
