import _Big from 'big.js'
import _Decimal from 'decimal.js-light'
import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import BaseCurrency from './BaseCurrency'
import Token from './Token'
import Fraction from './Fraction'
import toFormat from '../utils/toFormatBigOrDecimal'

const MaxUint256 = JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

const Decimal = toFormat(_Decimal)
const Big = toFormat(_Big)

const toSignificantRounding = {
  ROUND_DOWN: Decimal.ROUND_DOWN,
  ROUND_HALF_UP: Decimal.ROUND_HALF_UP,
  ROUND_UP: Decimal.ROUND_UP,
}

const toFixedRounding = {
  ROUND_DOWN: _Big.roundDown,
  ROUND_HALF_UP: _Big.roundHalfUp,
  ROUND_UP: _Big.roundUp,
}

/**
 * @typedef {(JSBI|string|number)} BigintIsh
 */
/**
 * @interface Rounding
 * @property {BigNumber.ROUND_DOWN} ROUND_DOWN
 * @property {BigNumber.ROUND_HALF_UP} ROUND_HALF_UP
 * @property {BigNumber.ROUND_UP} ROUND_UP
 */

// <T extends Currency>
export default class CurrencyAmount extends Fraction {
  /**
   * @readonly
   * @returns {BaseCurrency}
   */
  get currency() {
    return this._currency
  }

  /**
   * @readonly
   * @returns {JSBI}
   */
  get decimalScale() {
    return this._decimalScale
  }

  /**
   * Returns a new currency amount instance from the unitless amount of token, i.e. the raw amount
   * @param {BaseCurrency} currency the currency in the amount
   * @param {BigintIsh} rawAmount the raw token or ether amount
   * @returns {CurrencyAmount<BaseCurrency>}
   */
  static fromRawAmount(currency, rawAmount) {
    return new CurrencyAmount(currency, rawAmount)
  }

  /**
   * Construct a currency amount with a denominator that is not equal to 1
   * @param {BaseCurrency} currency the currency
   * @param {BigintIsh} numerator the numerator of the fractional token amount
   * @param {BigintIsh} denominator the denominator of the fractional token amount
   * @returns {CurrencyAmount<BaseCurrency>}
   */
  static fromFractionalAmount(currency, numerator, denominator) {
    return new CurrencyAmount(currency, numerator, denominator)
  }

  /**
   * @param {BaseCurrency} currency
   * @param {BigintIsh} numerator
   * @param {BigintIsh} [denominator]
   */
  constructor(currency, numerator, denominator) {
    super(numerator, denominator)
    invariant(JSBI.lessThanOrEqual(this.quotient, MaxUint256), 'AMOUNT')
    this._currency = currency
    this._decimalScale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(currency.decimals))
  }

  /**
   * @param {CurrencyAmount<BaseCurrency>} other
   * @return {CurrencyAmount<BaseCurrency>}
   */
  add(other) {
    invariant(this.currency.equals(other.currency), 'CURRENCY')
    const added = super.add(other)
    return CurrencyAmount.fromFractionalAmount(this.currency, added.numerator, added.denominator)
  }

  /**
   * @param {CurrencyAmount<BaseCurrency>} other
   * @return {CurrencyAmount<BaseCurrency>}
   */
  subtract(other) {
    invariant(this.currency.equals(other.currency), 'CURRENCY')
    const subtracted = super.subtract(other)
    return CurrencyAmount.fromFractionalAmount(this.currency, subtracted.numerator, subtracted.denominator)
  }

  /**
   * @param {Fraction|BigintIsh} other
   * @return {CurrencyAmount<BaseCurrency>}
   */
  multiply(other) {
    const multiplied = super.multiply(other)
    return CurrencyAmount.fromFractionalAmount(this.currency, multiplied.numerator, multiplied.denominator)
  }

  /**
   * @param {Fraction|BigintIsh} other
   * @return {CurrencyAmount<BaseCurrency>}
   */
  divide(other) {
    const divided = super.divide(other)
    return CurrencyAmount.fromFractionalAmount(this.currency, divided.numerator, divided.denominator)
  }

  /**
   * @param {number} [significantDigits=6]
   * @param {{groupSeparator:{string}}} [format={groupSeparator: ''}]
   * @param {Rounding} [rounding=toSignificantRounding.ROUND_DOWN]
   * @return {string}
   */
  toSignificant(
    significantDigits,
    format,
    rounding = toSignificantRounding.ROUND_DOWN,
  ) {
    return super.divide(this.decimalScale).toSignificant(significantDigits, format, rounding)
  }

  /**
   * @param {number} [decimalPlaces=this.currency.decimals]
   * @param {{groupSeparator:{string}}} [format={groupSeparator: ''}]
   * @param {Rounding} [rounding=toFixedRounding.ROUND_DOWN]
   * @return {string}
   */
  toFixed(
    decimalPlaces = this.currency.decimals,
    format,
    rounding = toFixedRounding.ROUND_DOWN,
  ) {
    invariant(decimalPlaces <= this.currency.decimals, 'DECIMALS')
    return super.divide(this.decimalScale).toFixed(decimalPlaces, format, rounding)
  }

  /**
   * @param {{groupSeparator: string}} [format={groupSeparator:''}]
   * @returns {string}
   */
  toExact(format = { groupSeparator: '' }) {
    Big.DP = this.currency.decimals
    return new Big(this.quotient.toString()).div(this.decimalScale.toString()).toFormat(format)
  }

  /**
   * @returns {CurrencyAmount<Token>}
   */
  get wrapped() {
    if (this.currency.isToken) return this
    return CurrencyAmount.fromFractionalAmount(this.currency.wrapped, this.numerator, this.denominator)
  }
}
