import { providers } from 'ethers'

import { useAppSelector } from '../states/hooks'

const { JsonRpcProvider } = providers

export default function useCustodialWeb3() : {
  account: string,
  chainId: number,
  library: providers.JsonRpcProvider,
  } {
  const accounts: string[] = useAppSelector((state) => state.user.addresses)
  const account: string = accounts[0] || ''

  return {
    account,
    chainId: 80001, // Polygon Mumbai
    library: new JsonRpcProvider('https://rpc-mumbai.matic.today'),
  }
}
