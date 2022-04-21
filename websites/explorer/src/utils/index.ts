import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import {
  constants, Contract, providers, utils, ContractInterface,
} from 'ethers'

import { tokenABIS } from '../constants/tokens'
import Token from '../entities/Token'

const { AddressZero } = constants
// const { JsonRpcSigner, Web3Provider } = providers // imported for types
const { getAddress } = utils

/**
 * Returns the checksummed address if the address is valid, otherwise returns false
 * @param {any} value
 * @return {string | false}
 */
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

/**
 * Shorten the checksummed version of the input address to have 0x + 4 characters at start and end
 * @param {string} address
 * @param {number} [chars=4]
 * @return {string}
 */
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

/**
 * @param {Web3Provider} library
 * @param {string} account NOT optional
 * @return {JsonRpcSigner}
 */
function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
/**
 * @param {Web3Provider} library
 * @param {string} [account]
 * @return {Web3Provider | JsonRpcSigner}
 */
function getProviderOrSigner(library: Web3Provider, account?: string) {
  return account ? getSigner(library, account) : library
}

/**
 * @param {string} address
 * @param {ContractInterface} ABI
 * @param {Web3Provider} library
 * @param {string} [account]
 * @returns {Contract}
 */
export function getContract(
  address: string,
  ABI: ContractInterface,
  library: Web3Provider,
  account?: string,
) {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account))
}

/**
 * @param {Token} token
 * @return {string}
 */
export function getTokenABI(token: Token): string {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return tokenABIS[token.symbol]
}
