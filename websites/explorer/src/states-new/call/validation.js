import { BigNumber } from 'ethers'

/**
 * @typedef {string | number | BigNumber} MethodArg
 * @typedef {Array<MethodArg | MethodArg[]>} MethodArgs
 */

/**
 * @param {?} x
 * @return {boolean}
 */
export function isMethodArg(x) {
  return BigNumber.isBigNumber(x) || ['string', 'number'].indexOf(typeof x) !== -1
}

/**
 * @param {?} x
 * @return {boolean}
 */
export function isValidMethodArgs(x) {
  return (
    x === undefined
    || (Array.isArray(x) && x.every((xi) => isMethodArg(xi) || (Array.isArray(xi) && xi.every(isMethodArg))))
  )
}
