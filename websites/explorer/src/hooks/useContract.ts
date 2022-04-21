// Adapted from: https://github.com/Uniswap/interface/blob/main/src/hooks/useContract.ts

import { Contract, ContractInterface } from 'ethers' // for type
import { useMemo } from 'react'

// import EIP_2612 from '../abis/eip_2612.json'
import ERC20_ABI from '../abis/erc20.json'
import SAMPLE_TOKEN_JSON from '../abis/SampleToken.json' // implements EIP2612
import useActiveWeb3React from './useActiveWeb3React'
import { getContract } from '../utils'
import { MULTICALL_ADDRESS } from '../constants/addresses'
import { NATIVE_TOKEN } from '../constants/tokens'

const { abi: SAMPLE_TOKEN_ABI } = SAMPLE_TOKEN_JSON

/**
 * @param {string | { [chainId: number]: string } | undefined } addressOrAddressMap
 * @param {ContractInterface} ABI
 * @param {boolean} [withSignerIfPossible=true]
 * @returns {Contract | null}
 */
// T extends Contract = Contract
export default function useContract(
  addressOrAddressMap: string | { [chainId: number]: string } | null,
  ABI: ContractInterface,
  withSignerIfPossible: boolean = true,
): Contract | null {
  const { library, account, chainId } = useActiveWeb3React()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !library || !chainId) return null

    let address
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]

    if (!address) return null

    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, library, chainId, withSignerIfPossible, account])
}

/**
 * Use SampleToken ABI (EIP2612)
 * @param {string} [tokenAddress]
 * @param {boolean} [withSignerIfPossible=true]
 * @param {ContractInterface} [ABI=SAMPLE_TOKEN_ABI]
 * @return {Contract | null}
 */
export function useTokenContract(
  tokenAddress: string,
  withSignerIfPossible: boolean = true,
  ABI: ContractInterface = SAMPLE_TOKEN_ABI,
): Contract | null {
  return useContract(tokenAddress, ABI, withSignerIfPossible)
}

/**
 * Use native token contract (currently ALMA)
 * @param {boolean} [withSignerIfPossible=true]
 * @return {Contract | null}
 */
export function useNativeTokenContract(withSignerIfPossible: boolean = true) {
  return useContract(NATIVE_TOKEN.address, SAMPLE_TOKEN_ABI, withSignerIfPossible)
}

/**
 * Use ERC20 ABI
 * @param {string} [tokenAddress]
 * @param {boolean} [withSignerIfPossible=true]
 * @return {ERC20}
 */
export function useERC20Contract(tokenAddress: string, withSignerIfPossible: boolean = true) {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

// export function useInterfaceMulticall() {
//   return useContract(MULTICALL_ADDRESS, MulticallABI, false)
// }

// /**
//  * Uses EIP2612 Contract
//  * @param {string} tokenAddress
//  * @return {Contract | null}
//  */
// export function useEIP2612Contract(tokenAddress) {
//   return useContract(tokenAddress, EIP_2612, false)
// }
