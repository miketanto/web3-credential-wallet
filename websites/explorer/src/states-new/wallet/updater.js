import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import JSBI from 'jsbi'
import useDebounce from '../../hooks/useDebounce'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'

import { updateBalances } from './index'
import { allTokens } from '../../constants/tokens'
import { CurrencyAmount } from '../../entities'
import { getContract, getTokenABI } from '../../utils'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'

export default function Updater() {
  const { account, library } = useActiveWeb3React()
  const dispatch = useDispatch()
  const windowVisible = useIsWindowVisible()
  const chainId = useSelector((state) => state.application.chainId)
  const blockNumber = useSelector((state) => state.application.blockNumber)

  const [balances, setBalances] = useState({})

  useEffect(() => {
    if (!chainId || !blockNumber || !account || !windowVisible) {
      setBalances({})
      return undefined
    }

    /**
     * Get all the token balances for the account. We need `_balances` as a temporary storage because
     *  setState doesn't mutate state right away, thus ...state.balances would be empty for all in the loop
     */
    const _balances = {}
    allTokens.forEach((token) => {
      const tokenABI = getTokenABI(token)
      const contract = getContract(token.address, tokenABI, library, account || undefined)

      _balances[token.symbol] = null

      contract.balanceOf(account)
        .then((value) => {
          // console.log(token.symbol, value)
          _balances[token.symbol] = CurrencyAmount.fromRawAmount(token, JSBI.BigInt(value.toString())).toSignificant(3)
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {
          setBalances({ ...balances, ..._balances })
        })
    })
  }, [dispatch, windowVisible, blockNumber, chainId])

  // Minimal update delay for state is 100ms (though our signers don't mine that fast, 100ms is what Uniswap uses)
  const debouncedBalances = useDebounce(balances, 100)

  useEffect(() => {
    if (!debouncedBalances || !windowVisible) return
    dispatch(updateBalances({ balances: debouncedBalances }))
  }, [windowVisible, dispatch, debouncedBalances])

  return null
}
