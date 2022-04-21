/*
 *  toFormat v2.0.0
 *  Adds a toFormat instance method to big.js or decimal.js
 *  Copyright (c) 2017 Michael Mclaughlin
 *  MIT Licence
 *
 *  FROM: https://github.com/MikeMcl/toFormat/blob/master/toFormat.js
 */

/**
 * Adds a `toFormat` method to `Ctor.prototype` and a `format` object to `Ctor`, where `Ctor` is
 *  a big number constructor such as `Decimal` (decimal.js) or `Big` (big.js).
 *
 * Returns a string representing the value of this big number in fixed-point notation to `dp`
 *  decimal places using rounding mode `rm`, and formatted according to the properties of the
 * `fmt`, `this.format` and `this.constructor.format` objects, in that order of precedence.
 */
export default function toFormat(Ctor) {
  Ctor.prototype.toFormat = function toFormat(dp, rm, fmt) {
    if (!this.e && this.e !== 0) return this.toString() // Infinity/NaN

    let g1; let g2; let i
    let u // undefined
    let nd // number of integer digits
    let intd // integer digits
    let intp // integer part
    let fracp // fraction part
    let dsep // decimalSeparator
    let gsep // groupSeparator
    let gsize // groupSize
    let sgsize // secondaryGroupSize
    let fgsep // fractionGroupSeparator
    let fgsize // fractionGroupSize
    const tfmt = this.format || {}
    const cfmt = this.constructor.format || {}

    if (dp !== u) {
      if (typeof dp === 'object') {
        fmt = dp
        dp = u
      } else if (rm !== u) {
        if (typeof rm === 'object') {
          fmt = rm
          rm = u
        } else if (typeof fmt !== 'object') {
          fmt = {}
        }
      } else {
        fmt = {}
      }
    } else {
      fmt = {}
    }

    [intp, fracp] = this.toFixed(dp, rm).split('.')
    // eslint-disable-next-line prefer-const
    intd = this.s < 0 ? intp.slice(1) : intp
    nd = intd.length

    dsep = fmt.decimalSeparator
    if (dsep === u) {
      dsep = tfmt.decimalSeparator
      if (dsep === u) {
        dsep = cfmt.decimalSeparator
        if (dsep === u) dsep = '.'
      }
    }

    gsep = fmt.groupSeparator
    if (gsep === u) {
      gsep = tfmt.groupSeparator
      if (gsep === u) gsep = cfmt.groupSeparator
    }

    if (gsep) {
      gsize = fmt.groupSize
      if (gsize === u) {
        gsize = tfmt.groupSize
        if (gsize === u) {
          gsize = cfmt.groupSize
          if (gsize === u) gsize = 0
        }
      }

      sgsize = fmt.secondaryGroupSize
      if (sgsize === u) {
        sgsize = tfmt.secondaryGroupSize
        if (sgsize === u) {
          sgsize = cfmt.secondaryGroupSize
          if (sgsize === u) sgsize = 0
        }
      }

      if (sgsize) {
        g1 = +sgsize
        g2 = +gsize
        nd -= g2
      } else {
        g1 = +gsize
        g2 = +sgsize
      }

      if (g1 > 0 && nd > 0) {
        i = nd % g1 || g1
        intp = intd.substr(0, i)
        for (; i < nd; i += g1) intp += gsep + intd.substr(i, g1)
        if (g2 > 0) intp += gsep + intd.slice(i)
        if (this.s < 0) intp = `-${intp}`
      }
    }

    if (fracp) {
      fgsep = fmt.fractionGroupSeparator
      if (fgsep === u) {
        fgsep = tfmt.fractionGroupSeparator
        if (fgsep === u) fgsep = cfmt.fractionGroupSeparator
      }

      if (fgsep) {
        fgsize = fmt.fractionGroupSize
        if (fgsize === u) {
          fgsize = tfmt.fractionGroupSize
          if (fgsize === u) {
            fgsize = cfmt.fractionGroupSize
            if (fgsize === u) fgsize = 0
          }
        }

        fgsize = +fgsize

        if (fgsize) {
          fracp = fracp.replace(new RegExp(`\\d{${fgsize}}\\B`, 'g'), `$&${fgsep}`)
        }
      }

      return intp + dsep + fracp
    }

    return intp
  }

  Ctor.format = {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: '',
    fractionGroupSize: 0,
  }

  return Ctor
}

if (typeof module !== 'undefined' && module.exports) module.exports = toFormat
