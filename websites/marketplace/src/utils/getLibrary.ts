import { providers } from 'ethers'

export default function getLibrary(): providers.JsonRpcProvider {
  return new providers.JsonRpcProvider(process.env.REACT_APP_WEB3_URL)
}
