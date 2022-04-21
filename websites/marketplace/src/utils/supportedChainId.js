import { SupportedChainId } from '../constants/chains'

/**
 * Returns the input chain ID if chain is supported. If not, return undefined
 * @param {number} chainId A chain ID, which will be returned if it is a supported chain ID
 * @return {number | undefined}
 */
export default function supportedChainId(chainId) {
  return Object.values(SupportedChainId).includes(chainId) ? chainId : undefined
}
