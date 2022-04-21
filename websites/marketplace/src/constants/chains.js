export const NETWORK_URLS = {
  1515: process.env.REACT_APP_WEB3_URL,
  ...(process.env.NODE_ENV !== 'production' ? {
    // 31337: 'http://localhost:8545',
    //1337: 'http://127.0.0.1:7545',
    1515:'http://141.142.218.249:10000'
  } : {}),
}

export const SupportedChainId = {
  MAINNET: 1515,
  ...(process.env.NODE_ENV !== 'production' ? {
    // MAINNET: 31337,
    MAINNET: 1337
  } : {}),
}

export const CHAIN_INFO = {
  [SupportedChainId.MAINNET]: {
    networkType: 'L1',
    explorer: 'https://iblockcore.com',
    label: 'iBlock',
    // logoUrl: ethereumLogoUrl,
    addNetworkInfo: {
      _nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      nativeCurrency: { name: 'Alma', symbol: 'ALMA', decimals: 2 },
      rpcUrl: NETWORK_URLS[SupportedChainId.MAINNET],
    },
  },
}
