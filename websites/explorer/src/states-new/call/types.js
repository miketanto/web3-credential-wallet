/**
 * @interface Call
 * @property {string} address
 * @property {string} callData
 * @property {number} [gasRequired]
 *
 * @interface CallStateResult
 * @readonly
 * @property {[key: {string}]: any}
 *
 * @interface CallState
 * @readonly
 * @property {boolean} valid
 * @property {CallStateResult | undefined} result - the result, or undefined if loading or errored/no data
 * @property {boolean} loading - true if the result has never been fetched
 * @property {boolean} syncing - true if the result is not for the latest block
 * @property {boolean} error - true if the call was made and is synced, but the return data is invalid
 *
 * @interface CallResult
 * @readonly
 * @property {boolean} valid
 * @property {string | undefined} data
 * @property {number | undefined} blockNumber
 *
 * @interface CallState
 * @property {{[chainId: number]: {[callKey: string]: {[blocksPerFetch: number]: number}}}} [callListeners]
 * @property {{[chainId: number]: {[callKey: string]: {[data]: (string | null), [blockNumber]: number, [fetchingBlockNumber]: number}}}} [callResults]
 *
 * @interface  WithCallState
 * @property {{[oath: string]: CallState}}
 *
 * @interface ListenerOptions
 * @readonly
 * @property {number} blocksPerFetch how often this data should be fetched, by default 1
 *
 * @interface {ListenerOptions} ListenerOptions
 * @readonly
 * @property {number} [gasRequired]
 *
 * @interface CallListenerPayload
 * @property {number} chainId
 * @property {Call} call
 * @property {ListenerOptions} options
 *
 * @interface CallFetchingPayload
 * @property {number} chainId
 * @property {Call} call
 * @property {number} fetchingBlockNumber
 *
 * @interface CallResultsPayload
 * @property {number} chainId
 * @property {number} blockNumber
 * @property {{[callKey: string]: string | null}} result
 */
