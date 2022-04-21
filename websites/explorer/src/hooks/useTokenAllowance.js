// Adapted from: https://github.com/Uniswap/interface/blob/main/src/hooks/useTokenAllowance.ts

import { useMemo } from 'react'

import { CurrencyAmount, Token } from '../entities'

import { useSingleCallResult } from '../states-new/multicall/hooks'
import { useTokenContract } from './useContract'

/**
 *
 * @param {Token} token
 * @param {string} owner
 * @param {string} spender
 * @returns {CurrencyAmount<Token> | undefined}
 */
export default function useTokenAllowance(token, owner, spender) {
  const contract = useTokenContract(token.address || '', false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const allowance = useSingleCallResult(contract, 'allowance', inputs).result

  return useMemo(
    () => (token && allowance ? CurrencyAmount.fromRawAmount(token, allowance.toString()) : undefined),
    [token, allowance],
  )
}
