// Adapted from: https://github.com/Uniswap/interface/blob/main/src/hooks/useERC20Permit.ts

import { utils } from 'ethers'
import JSBI from 'jsbi'
import { useMemo, useState } from 'react'

import { ALMA, UNI, QUAD } from '../constants/tokens'
import {
  BaseCurrency as Currency, CurrencyAmount, Token, Trade,
} from '../entities'
import { useSingleCallResult } from '../states-new/multicall/hooks'
import { useEIP2612Contract } from './useContract'
import useTransactionDeadline from './useTransactionDeadline'
import useActiveWeb3React from './useActiveWeb3React'

const { splitSignature } = utils

// 20 minutes to submit after signing
const PERMIT_VALIDITY_BUFFER = 20 * 60

/**
 * Permit types
 * @enum {number}
 */
const PermitType = { AMOUNT: 1, ALLOWED: 2 }

/**
 * @interface PermitInfo
 * @property {PermitType} type
 * @property {string} name
 * @property {string} [version] Version is optional, and if omitted, will not be included in the domain
 */

const SHARED_PERMITTABLE_TOKENS = {
  [ALMA.address]: { type: PermitType.ALLOWED, name: 'Alma Coin', version: '1' },
  [UNI.address]: { type: PermitType.ALLOWED, name: 'UNI Coin', version: '1' },
  [QUAD.address]: { type: PermitType.ALLOWED, name: 'QUAD Coin', version: '1' },
}

const PERMITTABLE_TOKENS = {
  1337: SHARED_PERMITTABLE_TOKENS,
  1515: SHARED_PERMITTABLE_TOKENS,
  31337: SHARED_PERMITTABLE_TOKENS,
}

/**
 * @enum
 */
const UseERC20PermitState = {
  // returned for any reason, e.g. it is an argent wallet, or the currency does not support it
  NOT_APPLICABLE: 'NOT_APPLICABLE',
  LOADING: 'LOADING',
  NOT_SIGNED: 'NOT_SIGNED',
  SIGNED: 'SIGNED',
}

/**
 * @interface BaseSignatureData
 * @property {number} v
 * @property {string} r
 * @property {string} s
 * @property {number} deadline
 * @property {number} nonce
 * @property {string} owner
 * @property {string} spender
 * @property {number} chainId
 * @property {string} tokenAddress
 * @property {PermitType} permitType
 *
 * @interface {BaseSignatureData} StandardSignatureData
 * @property {string} amount
 *
 * @inheritDoc {BaseSignatureData} AllowedSignatureData
 * @property {true} allowed
 *
 * @typedef {(StandardSignatureData | AllowedSignatureData)} SignatureData
 */

const EIP712_DOMAIN_TYPE = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

const EIP712_DOMAIN_TYPE_NO_VERSION = [
  { name: 'name', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

const EIP2612_TYPE = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
]

const PERMIT_ALLOWED_TYPE = [
  { name: 'holder', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'nonce', type: 'uint256' },
  { name: 'expiry', type: 'uint256' },
  { name: 'allowed', type: 'bool' },
]

/**
 *
 * @param {CurrencyAmount<Currency> | null | undefined} currencyAmount
 * @param {string | null | undefined} spender
 * @param {PermitInfo | undefined | null} overridePermitInfo
 * @return {{signatureData: (SignatureData|null), state: UseERC20PermitState, gatherPermitSignature: (null | function)}}
 */
function useERC20Permit(currencyAmount, spender, overridePermitInfo) {
  const { account, chainId, library } = useActiveWeb3React()
  const transactionDeadline = useTransactionDeadline()
  const tokenAddress = currencyAmount.currency && currencyAmount.currency.isToken ? currencyAmount.currency.address : undefined
  const eip2612Contract = useEIP2612Contract(tokenAddress)
  const nonceInputs = useMemo(() => [account ?? undefined], [account])
  const tokenNonceState = useSingleCallResult(eip2612Contract, 'nonces', nonceInputs)
  const permitInfo = overridePermitInfo ?? (chainId && tokenAddress && PERMITTABLE_TOKENS[chainId] ? PERMITTABLE_TOKENS[chainId][tokenAddress] : undefined)

  const [signatureData, setSignatureData] = useState(null) // <SignatureData | null>

  return useMemo(() => {
    if (
      !currencyAmount
      || !eip2612Contract
      || !account
      || !chainId
      || !transactionDeadline
      || !library
      || !tokenNonceState.valid
      || !tokenAddress
      || !spender
      || !permitInfo
    ) {
      return {
        state: UseERC20PermitState.NOT_APPLICABLE,
        signatureData: null,
        gatherPermitSignature: null,
      }
    }

    const nonceNumber = tokenNonceState.result?.[0]?.toNumber()
    if (tokenNonceState.loading || typeof nonceNumber !== 'number') {
      return {
        state: UseERC20PermitState.LOADING,
        signatureData: null,
        gatherPermitSignature: null,
      }
    }

    const isSignatureDataValid = signatureData
      && signatureData.owner === account
      && signatureData.deadline >= transactionDeadline.toNumber()
      && signatureData.tokenAddress === tokenAddress
      && signatureData.nonce === nonceNumber
      && signatureData.spender === spender
      && ('allowed' in signatureData || JSBI.equal(JSBI.BigInt(signatureData.amount), currencyAmount.quotient))

    return {
      state: isSignatureDataValid ? UseERC20PermitState.SIGNED : UseERC20PermitState.NOT_SIGNED,
      signatureData: isSignatureDataValid ? signatureData : null,
      gatherPermitSignature: async function gatherPermitSignature() {
        const allowed = permitInfo.type === PermitType.ALLOWED
        const signatureDeadline = transactionDeadline.toNumber() + PERMIT_VALIDITY_BUFFER
        const value = currencyAmount.quotient.toString()

        const message = allowed
          ? {
            holder: account,
            spender,
            allowed,
            nonce: nonceNumber,
            expiry: signatureDeadline,
          }
          : {
            owner: account,
            spender,
            value,
            nonce: nonceNumber,
            deadline: signatureDeadline,
          }
        const domain = permitInfo.version
          ? {
            name: permitInfo.name,
            version: permitInfo.version,
            verifyingContract: tokenAddress,
            chainId,
          }
          : {
            name: permitInfo.name,
            verifyingContract: tokenAddress,
            chainId,
          }
        const data = JSON.stringify({
          types: {
            EIP712Domain: permitInfo.version ? EIP712_DOMAIN_TYPE : EIP712_DOMAIN_TYPE_NO_VERSION,
            Permit: allowed ? PERMIT_ALLOWED_TYPE : EIP2612_TYPE,
          },
          domain,
          primaryType: 'Permit',
          message,
        })

        return library
          .send('eth_signTypedData_v4', [account, data])
          .then(splitSignature)
          .then((signature) => {
            setSignatureData({
              v: signature.v,
              r: signature.r,
              s: signature.s,
              deadline: signatureDeadline,
              ...(allowed ? { allowed } : { amount: value }),
              nonce: nonceNumber,
              chainId,
              owner: account,
              spender,
              tokenAddress,
              permitType: permitInfo.type,
            })
          })
      },
    }
  }, [
    currencyAmount,
    eip2612Contract,
    account,
    chainId,
    transactionDeadline,
    library,
    tokenNonceState.loading,
    tokenNonceState.valid,
    tokenNonceState.result,
    tokenAddress,
    spender,
    permitInfo,
    signatureData,
  ])
}

/**
 *
 * @param trade
 * @param allowedSlippage
 * @return {{signatureData: (SignatureData|null), state: UseERC20PermitState, gatherPermitSignature: (Function|null)}}
 */
// export function useERC20PermitFromTrade(
//   trade:
//     | V2Trade<Currency, Currency, TradeType>
//       | V3Trade<Currency, Currency, TradeType>
//       | Trade<Currency, Currency, TradeType>
//       | undefined,
//   allowedSlippage: Percent
// ) {
//   const { chainId } = useActiveWeb3React()
//   const swapRouterAddress = chainId
//     ? // v2 router does not support
//     trade instanceof V2Trade
//       ? undefined
//       : trade instanceof V3Trade
//         ? V3_ROUTER_ADDRESS[chainId]
//         : SWAP_ROUTER_ADDRESSES[chainId]
//     : undefined
//   const amountToApprove = useMemo(
//     () => (trade ? trade.maximumAmountIn(allowedSlippage) : undefined),
//     [trade, allowedSlippage]
//   )
//
//   return useERC20Permit(amountToApprove, swapRouterAddress, null)
// }
