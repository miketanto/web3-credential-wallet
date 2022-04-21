import ms from 'ms'

// We don't need to load .env file here since NODE_ENV is defined when running the command, e.g.:
// NODE_ENV='name' node file.js (by default, we assume it's `development`)
export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const IS_LOCAL = process.env.NODE_ENV === 'local'

export const LOG_INTERVAL = 1000 // blocks
export const QUEUE_TIMEOUT = ms('1 second')

export const CHAIN_NATIVE_DECIMALS = 18 // Using Ethereum chain with native Ether, which has 18 decimals

const WEB3_URL_PROD = 'https://chain.iblockcore.com'
const WEB3_URL_DEV = 'https://devchain.iblockcore.com'
const WEB3_URL_LOCAL = 'http://localhost:8545'

export const WEB3_URL = IS_PRODUCTION ? WEB3_URL_PROD : IS_LOCAL ? WEB3_URL_LOCAL : WEB3_URL_DEV

export const NETWORK = {
  name: IS_PRODUCTION ? 'iBlock' : IS_LOCAL ? 'iBlock Local' : 'iBlock Dev',
  chainId: IS_LOCAL ? 31337 : 1515,
}
