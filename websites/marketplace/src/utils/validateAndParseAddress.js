import { utils } from 'ethers'

/**
 * Validates an address and returns the parsed (checksummed) version of that address
 * @param {string} address the unchecksummed hex address
 * @returns {string}
 */
export default function validateAndParseAddress(address) {
  try {
    return utils.getAddress(address)
  } catch (error) {
    throw new Error(`${address} is not a valid address.`)
  }
}
