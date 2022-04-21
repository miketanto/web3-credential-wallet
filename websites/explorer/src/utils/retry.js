/**
 * @param {number} ms
 * @return {Promise<void>}
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * @param {number} min
 * @param {number} max
 * @return {Promise<void>}
 */
function waitRandom(min, max) {
  return wait(min + Math.round(Math.random() * Math.max(0, max - min)))
}

/**
 * This error is thrown if the function is cancelled before completing
 */
class CancelledError extends Error {
  // eslint-disable-next-line class-methods-use-this
  get isCancelledError() {
    return true
  }

  constructor() {
    super('Cancelled')
  }
}

/**
 * Throw this error if the function should retry
 */
export class RetryableError extends Error {
  // eslint-disable-next-line class-methods-use-this
  get isRetryableError() {
    return true
  }
}

/**
 * @interface RetryOptions
 * @property {number} n How many times to retry
 * @property {number} minWait Min wait between retries in ms
 * @property {number} maxWait Max wait between retries in ms
 */

/**
 * Retries the function that returns the promise until the promise successfully resolves up to n retries
 * @param {function} fn Function to retry, should return Promise<*>
 * @param {RetryOptions} params
 * @return {{promise: Promise<*>, cancel: () => void}}
 */
export function retry(fn, { n, minWait, maxWait }) {
  let completed = false
  let rejectCancelled

  const promise = new Promise(async (resolve, reject) => {
    rejectCancelled = reject
    while (true) {
      let result
      try {
        result = await fn()
        if (!completed) {
          resolve(result)
          completed = true
        }
        break
      } catch (error) {
        if (completed) {
          break
        }
        if (n <= 0 || !error.isRetryableError) {
          reject(error)
          completed = true
          break
        }
        n--
      }
      await waitRandom(minWait, maxWait)
    }
  })
  return {
    promise,
    cancel: () => {
      if (completed) return
      completed = true
      if (typeof rejectCancelled === 'function') rejectCancelled(new CancelledError())
    },
  }
}
