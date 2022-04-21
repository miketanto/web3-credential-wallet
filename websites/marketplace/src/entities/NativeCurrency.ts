import BaseCurrency from './BaseCurrency'

/**
 * Represents the native currency of the chain on which it resides, e.g.
 */
export default abstract class NativeCurrency extends BaseCurrency {
  public readonly isNative: true = true

  public readonly isToken: false = false
}
