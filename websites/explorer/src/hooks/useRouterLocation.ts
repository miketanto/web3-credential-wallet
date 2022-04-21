import { createBrowserHistory } from 'history'
import { useEffect, useRef } from 'react'

export default function useRouterLocation(callback: () => void): void {
  const history = createBrowserHistory()
  const savedCallback = useRef<() => void>(() => {})

  useEffect(() => {
    savedCallback.current = callback
  }, [])

  useEffect(() => {
    const currentCallback = () => savedCallback.current()
    const listen = history.listen(() => currentCallback())
    return () => listen()
  }, [history])
}
