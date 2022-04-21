import JSBI from 'jsbi'
import { useEffect, useMemo, useState } from 'react'

import { abi as SampleTokenABI } from '../../abis/SampleToken.json'
import ERC20ABI from '../../abis/erc20.json'
import { useBlockNumber } from '../application/hooks'
import { BaseCurrency as Currency, CurrencyAmount, Token } from '../../entities'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { useNativeTokenContract } from '../../hooks/useContract'
import { isAddress } from '../../utils'
import { ALMA } from '../../constants/tokens'

/**
 * Returns address balance of native token
 * @param uncheckedAddress
 * @return {string|unknown}
 *
 * NOTE: For now, Alma is the "native" currency (for user; our chain uses Ether as the native currency)
 * TODO: Support quering multiple addresses at once w/ Multicall (aggregating constant function call data) and useMemo
 */
export function useNativeCurrencyBalance(uncheckedAddress) {
  const { chainId } = useActiveWeb3React()
  const [balance, setBalance] = useState(CurrencyAmount.fromRawAmount(ALMA, JSBI.BigInt('0')))

  const validAddress = isAddress(uncheckedAddress) ? uncheckedAddress : null
  const contract = useNativeTokenContract()

  useEffect(() => {
    if (!contract) return null

    contract.balanceOf(validAddress)
      .then((value) => setBalance(CurrencyAmount.fromRawAmount(ALMA, JSBI.BigInt(value.toString()))))
      .catch((err) => {
        console.log(err)
        setBalance(null)
      })
  }, [validAddress, chainId])

  return balance
}

// /**
//  * Get balance of all tokens
//  * @param {string} [address]
//  * @param {(Token | undefined)[]} [tokens]
//  * @return {{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }}
//  */
// export function useTokenBalances(address, tokens) {
//   return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
// }
//
// /**
//  * Get the balance for a single token/account combo
//  * @param {string} [account]
//  * @param {Token} [token]
//  * @return {CurrencyAmount<Token> | undefined}
//  */
// export function useTokenBalance(account, token) {
//   const tokenBalances = useTokenBalances(account, [token])
//   if (!token) return undefined
//   return tokenBalances[token.address]
// }
//
// /**
//  * @param {string} [account]
//  * @param {(Currency | undefined)[]} [currencies]
//  * @return {(CurrencyAmount<Currency> | undefined)[]}
//  */
// export function useCurrencyBalances(account, currencies) {
//   const tokens = useMemo(
//     () => currencies.filter((currency) => currency.isToken ?? false) ?? [],
//     [currencies]
//   )
//   const tokenBalances = useTokenBalances(account, tokens)
//
//   return useMemo(
//     () =>
//       currencies.map((currency) => {
//         if (!account || !currency) return undefined
//         if (currency.isToken) return tokenBalances[currency.address]
//         return undefined
//       }) ?? [],
//     [account, currencies, tokenBalances]
//   )
// }
//
// /**
//  * @param {string} [account]
//  * @param {Currency} [currency]
//  * @return {CurrencyAmount<Currency> | undefined}
//  */
// export function useCurrencyBalance(account, currency) {
//   return useCurrencyBalances(
//     account,
//     useMemo(() => [currency], [currency])
//   )[0]
// }
//
// /**
//  * Mimics useAllBalances
//  * @return {{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }}
//  */
// export function useAllTokenBalances() {
//   const { account } = useActiveWeb3React()
//   const allTokens = useAllTokens()
//   const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
//   const balances = useTokenBalances(account ?? undefined, allTokensArray)
//   return balances ?? {}
// }
