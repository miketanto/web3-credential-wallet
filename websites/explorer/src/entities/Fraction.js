import JSBI from 'jsbi'
import invariant from 'tiny-invariant'
import _Decimal from 'decimal.js-light'
import _Big from 'big.js'

import toFormat from '../utils/toFormatBigOrDecimal'

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

export default class Fraction {
  /**
   * @readonly
   * @returns {JSBI}
   */
  get numerator() {
    return this._numerator
  }

  /**
   * @readonly
   * @returns {JSBI}
   */
  get denominator() {
    return this._denominator
  }

  /**
   * @param {BigintIsh} numerator
   * @param {BigintIsh} denominator
   */
  constructor(numerator, denominator = JSBI.BigInt(1)) {
    this._numerator = JSBI.BigInt(numerator)
    this._denominator = JSBI.BigInt(denominator)
  }

  /**
   * @param {BigintIsh|Fraction} fractionish
   * @return {Fraction|{denominator}|{numerator}|BigintIsh|Fraction}
   */
  static _tryParseFraction(fractionish) {
    if (fractionish instanceof JSBI || typeof fractionish === 'number' || typeof fractionish === 'string') return new Fraction(fractionish)

    if ('numerator' in fractionish && 'denominator' in fractionish) return fractionish
    throw new Error('Could not parse fraction')
  }

  /**
   * Performs floor division
   * @return {JSBI}
   */
  get quotient() {
    return JSBI.divide(this.numerator, this.denominator)
  }

  /**
   * Remainder after floor division
   * @return {Fraction}
   */
  get remainder() {
    return new Fraction(JSBI.remainder(this.numerator, this.denominator), this.denominator)
  }

  /**
   * Inverts denominator & numerator
   * @return {Fraction}
   */
  invert() {
    return new Fraction(this.denominator, this.numerator)
  }

  /**
   * @param {Fraction|BigintIsh} other
   * @return {Fraction}
   */
  add(other) {
    const otherParsed = Fraction._tryParseFraction(other)
    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.add(this.numerator, otherParsed.numerator), this.denominator)
    }
    return new Fraction(
      JSBI.add(
        JSBI.multiply(this.numerator, otherParsed.denominator),
        JSBI.multiply(otherParsed.numerator, this.denominator),
      ),
      JSBI.multiply(this.denominator, otherParsed.denominator),
    )
  }

  /**
   * @param {Fraction|BigintIsh} other
   * @return {Fraction}
   */
  subtract(other) {
    const otherParsed = Fraction._tryParseFraction(other)
    if (JSBI.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI.subtract(this.numerator, otherParsed.numerator), this.denominator)
    }
    return new Fraction(
      JSBI.subtract(
        JSBI.multiply(this.numerator, otherParsed.denominator),
        JSBI.multiply(otherParsed.numerator, this.denominator),
      ),
      JSBI.multiply(this.denominator, otherParsed.denominator),
    )
  }

  /**
   * @param {Fraction|BigintIsh} other
   * @return {boolean}
   */
  lessThan(other) {
    const otherParsed = Fraction._tryParseFraction(other)
    return JSBI.lessThan(
      JSBI.multiply(this.numerator, otherParsed.denominator),
      JSBI.multiply(otherParsed.numerator, this.denominator),
    )
  }

  /**
   * @param {Fraction|BigintIsh} other
   * @return {boolean}
   */
  equalTo(other) {
    const otherParsed = Fraction._tryParseFraction(other)
    return JSBI.equal(
      JSBI.multiply(this.numerator, otherParsed.denominator),
      JSBI.multiply(otherParsed.numerator, this.denominator),
    )
  }

  /**
   * @param {Fraction|BigintIsh} other
   * @return {boolean}
   */
  greaterThan(other) {
    const otherParsed = Fraction._tryParseFraction(other)
    return JSBI.greaterThan(
      JSBI.multiply(this.numerator, otherParsed.denominator),
      JSBI.multiply(otherParsed.numerator, this.denominator),
    )
  }

  /**
   * @param {Fraction|BigintIsh} other
   * @return {Fraction}
   */
  multiply(other) {
    const otherParsed = Fraction._tryParseFraction(other)
    return new Fraction(
      JSBI.multiply(this.numerator, otherParsed.numerator),
      JSBI.multiply(this.denominator, otherParsed.denominator),
    )
  }

  /**
   * @param {Fraction|BigintIsh} other
   * @return {Fraction}
   */
  divide(other) {
    const otherParsed = Fraction._tryParseFraction(other)
    return new Fraction(
      JSBI.multiply(this.numerator, otherParsed.denominator),
      JSBI.multiply(this.denominator, otherParsed.numerator),
    )
  }

  /**
   * @param {number} significantDigits
   * @param {{groupSeparator:{string}}} [format={groupSeparator: ''}]
   * @param {Rounding} [rounding=toSignificantRounding.ROUND_HALF_UP]
   * @return {string}
   */
  toSignificant(
    significantDigits,
    format = { groupSeparator: '' },
    rounding = toSignificantRounding.ROUND_HALF_UP,
  ) {
    invariant(Number.isInteger(significantDigits), `${significantDigits} is not an integer.`)
    invariant(significantDigits > 0, `${significantDigits} is not positive.`)

    Decimal.set({ precision: significantDigits + 1, rounding: toSignificantRounding[rounding] })
    const quotient = new Decimal(this.numerator.toString())
      .div(this.denominator.toString())
      .toSignificantDigits(significantDigits)
    return quotient.toFormat(quotient.decimalPlaces(), format)
  }

  /**
   * @param {number} decimalPlaces
   * @param {{groupSeparator:{string}}} [format={groupSeparator: ''}]
   * @param {Rounding} [rounding=toFixedRounding.ROUND_HALF_UP]
   * @return {string}
   */
  toFixed(
    decimalPlaces,
    format = { groupSeparator: '' },
    rounding = toFixedRounding.ROUND_HALF_UP,
  ) {
    invariant(Number.isInteger(decimalPlaces), `${decimalPlaces} is not an integer.`)
    invariant(decimalPlaces >= 0, `${decimalPlaces} is negative.`)

    Big.DP = decimalPlaces
    Big.RM = toFixedRounding[rounding]
    return new Big(this.numerator.toString()).div(this.denominator.toString()).toFormat(decimalPlaces, format)
  }

  /**
   * Helper method for converting any super class back to a fraction
   * @readonly
   * @returns Fraction
   */
  get asFraction() {
    return new Fraction(this.numerator, this.denominator)
  }
}
