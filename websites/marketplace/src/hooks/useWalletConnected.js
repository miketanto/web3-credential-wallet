import useActiveWeb3React from './useActiveWeb3React'

export default function useWalletConnected() {
    const { library, account, chainId } = useActiveWeb3React()
    if(!account) return ('disconnected')
    else if(chainId !=1515) return ('badNetwork') 
    else return('connected')
}
