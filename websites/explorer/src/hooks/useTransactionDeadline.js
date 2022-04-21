import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { BigNumber } from 'ethers' // for type

import useActiveWeb3React from './useActiveWeb3React'
import useCurrentBlockTimestamp from './useCurrentBlockTimestamp'

/**
 * Combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
 * @return {BigNumber | undefined}
 */
export default function useTransactionDeadline() {
  const { chainId } = useActiveWeb3React()
  const ttl = useSelector((state) => state.user.userDeadline)
  const blockTimestamp = useCurrentBlockTimestamp()
  return useMemo(() => {
    if (blockTimestamp && ttl) return blockTimestamp.add(ttl)
    return undefined
  }, [blockTimestamp, chainId, ttl])
}
