import { useEffect } from 'react'
import { createBrowserHistory } from 'history'

export default function useRouter(callback: () => void): void {
  const history = createBrowserHistory()
  useEffect(() => {
    let currentUrl = `${history.location.pathname}${history.location.search}`
    const listen = history.listen((location: { pathname: string | null; search: string | null }) => {
      if (currentUrl !== `${location.pathname}${location.search}`) {
        callback()
      }
      currentUrl = `${location.pathname}${location.search}`
    })
    return () => {
      listen()
    }
  }, [callback, history])
}
