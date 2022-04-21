import { ethers } from 'ethers'

import envVars from '../config/env-vars'

export const provider = new ethers.providers.JsonRpcProvider(envVars.web3NodeUrl)
