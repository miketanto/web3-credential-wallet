// import for types
import BaseCurrency from './BaseCurrency'
import NativeCurrency from './NativeCurrency'
import Token from './Token'
// import { WETH9 } from './weth9'

/**
 * Ether is the main usage of a 'native' currency, i.e. for Ethereum mainnet and all testnets
 *
 * (NOTE: no WETH for us, we don't let users trade "ETH")
 */
export default class Ether extends NativeCurrency {
  /**
   * @param {number} chainId
   */
  constructor(chainId) {
    super(chainId, 18, 'ETH', 'Ether')
  }

  /**
   * @readonly
   * @returns {Token}
   */
  get wrapped() {
    // const weth9 = WETH9[this.chainId]
    // invariant(!!weth9, 'WRAPPED')
    // return weth9
    return this
  }

  /**
   * @param {number} chainId
   * @return {Ether}
   */
  static onChain(chainId) {
    // eslint-disable-next-line no-return-assign
    return this._etherCache[chainId] ?? (this._etherCache[chainId] = new Ether(chainId))
  }

  /**
   *
   * @param {BaseCurrency} other
   * @return {boolean}
   */
  equals(other) {
    return other.isNative && other.chainId === this.chainId
  }
}

// Static const definition, type: { [chainId: number]: Ether }
Ether._etherCache = {}
