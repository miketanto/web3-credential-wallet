import { useWeb3React } from '@web3-react/core'

import { NetworkContextName } from '../constants/misc'

export default function useActiveWeb3React() {
  const interfaceContext = useWeb3React()
  const interfaceNetworkContext = useWeb3React(NetworkContextName)

  if (interfaceContext.active) return interfaceContext
  return interfaceNetworkContext
}
