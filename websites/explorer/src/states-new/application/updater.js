import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import useDebounce from '../../hooks/useDebounce'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import supportedChainId from '../../utils/supportedChainId'

import { updateBlockNumber, updateChainId } from './index'

/*
// we don't need this right now as we don't use TheGraph & our chainId should remain the same
function useQueryCacheInvalidator() {
  const dispatch = useDispatch()

  // subscribe to `chainId` changes in the redux store rather than Web3
  // this will ensure that when `invalidateTags` is called, the latest
  // `chainId` is available in redux to build the subgraph url
  const chainId = useSelector((state) => state.application.chainId)

  useEffect(() => {
    dispatch(api.util.invalidateTags([CHAIN_TAG]))
  }, [chainId, dispatch])
}
*/

export default function Updater() {
  const { chainId, library } = useActiveWeb3React()
  const dispatch = useDispatch()
  const windowVisible = useIsWindowVisible()

  // { chainId: number | undefined; blockNumber: number | null }
  const [state, setState] = useState({
    chainId,
    blockNumber: null,
  })

  // useQueryCacheInvalidator()

  const blockNumberCallback = useCallback(
    (blockNumber) => {
      setState((state) => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number') return { chainId, blockNumber }
          return { chainId, blockNumber: Math.max(blockNumber, state.blockNumber) }
        }
        return state
      })
    },
    [chainId, setState],
  )

  // attach/detach listeners
  useEffect(() => {
    if (!library || !chainId || !windowVisible) return undefined

    setState({ chainId, blockNumber: null })

    library
      .getBlockNumber()
      .then(blockNumberCallback)
      .catch((error) => console.error(`Failed to get block number for chainId: ${chainId}`, error))

    library.on('block', blockNumberCallback)
    return () => {
      library.removeListener('block', blockNumberCallback)
    }
  }, [dispatch, chainId, library, blockNumberCallback, windowVisible])

  // Minimal update delay for state is 100ms (though our signers don't mine that fast, 100ms is what Uniswap uses)
  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return
    dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber }))
  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

  useEffect(() => {
    dispatch(
      updateChainId({ chainId: debouncedState.chainId ? supportedChainId(debouncedState.chainId) ?? null : null }),
    )
  }, [dispatch, debouncedState.chainId])

  return null
}
