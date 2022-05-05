// returns the checksummed address if the address is valid, otherwise returns false
import {
  constants, providers, utils, Contract,
} from 'ethers'

const { AddressZero } = constants
const { getAddress } = utils

export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

// account is not optional
function getSigner(library: providers.JsonRpcProvider, account: string): providers.JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
function getProviderOrSigner(library: providers.JsonRpcProvider, account?: string): providers.JsonRpcProvider | providers.JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: providers.JsonRpcProvider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}
