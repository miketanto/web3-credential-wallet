export const FETCH_RETRY_CONFIG = {
  n: Infinity,
  minWait: 1000,
  maxWait: 2500,
}

export const DEFAULT_CALL_GAS_REQUIRED = 1_000_000
export const DEFAULT_CHUNK_GAS_REQUIRED = 200_000
export const CHUNK_GAS_LIMIT = 100_000_000
export const CONSERVATIVE_BLOCK_GAS_LIMIT = 10_000_000 // conservative, hard-coded estimate of the current block gas limit

/** @interface CallResult */
export const INVALID_RESULT = { valid: false, blockNumber: undefined, data: undefined }

/** @interface CallState */
export const INVALID_CALL_STATE = {
  valid: false,
  result: undefined,
  loading: false,
  syncing: false,
  error: false,
}

/** @interface CallState */
export const LOADING_CALL_STATE = {
  valid: true,
  result: undefined,
  loading: true,
  syncing: true,
  error: false,
}
