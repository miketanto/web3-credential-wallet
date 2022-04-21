import { DEFAULT_CHUNK_GAS_REQUIRED } from './constants'

/**
 * @interface Call
 * @property {string} address
 * @property {string} callData
 * @property {number} [gasRequired]
 */
// interface Bin<T> {
//   calls: T[]
//   cumulativeGasLimit: number
// }
/**
 * @param {Call} call
 * @return {string}
 */
export function toCallKey(call) {
  let key = `${call.address}-${call.callData}`
  if (call.gasRequired) {
    if (!Number.isSafeInteger(call.gasRequired)) {
      throw new Error(`Invalid number: ${call.gasRequired}`)
    }
    key += `-${call.gasRequired}`
  }
  return key
}

/**
 *
 * @param {string} callKey
 * @return {Call}
 */
export function parseCallKey(callKey) {
  const pcs = callKey.split('-')
  if (![2, 3].includes(pcs.length)) {
    throw new Error(`Invalid call key: ${callKey}`)
  }
  return {
    address: pcs[0],
    callData: pcs[1],
    ...(pcs[2] ? { gasRequired: Number.parseInt(pcs[2]) } : {}),
  }
}

/**
 * @param {Array<Call | undefined>} calls
 */
export function callsToCallKeys(calls) {
  try {
    return calls.filter((c) => Boolean(c)).map(toCallKey).sort() ?? []
  } catch (err) {
    console.log(err)
    return []
  }
}

/**
 * @param {string[]} callKeys
 * @return {null|*}
 */
export function callKeysToCalls(callKeys) {
  if (!callKeys?.length) return null
  return callKeys.map((key) => parseCallKey(key))
}

// <T extends { gasRequired?: number }>
/**
 * Tries to pack a list of items into as few bins as possible using the first-fit bin packing algorithm
 * @param {T[]} calls the calls to chunk
 * @param {number} chunkGasLimit the gas limit of any one chunk of calls, i.e. bin capacity
 * @param {number} [defaultGasRequired=DEFAULT_CHUNK_GAS_REQUIRED] the default amount of gas an individual call should cost if not specified
 * @return {T[][]}
 */
export function chunkCalls(calls, chunkGasLimit, defaultGasRequired = DEFAULT_CHUNK_GAS_REQUIRED) {
  return (
    calls
    // first sort by gas required
      .sort((c1, c2) => (c2.gasRequired ?? defaultGasRequired) - (c1.gasRequired ?? defaultGasRequired))
      // then bin the calls according to the first fit algorithm
      .reduce((bins, call) => { // <Bin<T>[]>
        const gas = call.gasRequired ?? defaultGasRequired
        // eslint-disable-next-line no-restricted-syntax
        for (const bin of bins) {
          if (bin.cumulativeGasLimit + gas <= chunkGasLimit) {
            bin.calls.push(call)
            bin.cumulativeGasLimit += gas
            return bins
          }
        }
        // didn't find a bin for the call, make a new bin
        bins.push({
          calls: [call],
          cumulativeGasLimit: gas,
        })
        return bins
      }, [])
      // pull out just the calls from each bin
      .map((b) => b.calls)
  )
}
