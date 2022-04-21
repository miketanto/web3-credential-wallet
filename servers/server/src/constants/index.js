import { providers } from 'ethers'

import envVars from '../config/env-vars'

export const provider = new providers.StaticJsonRpcProvider(envVars.web3NodeUrl, {
  name: 'iBlock Core Dev',
  chainId: 1515,
})
