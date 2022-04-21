import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { updateMatchesDarkMode } from './actions'

export default function Updater() {
  const dispatch = useDispatch()

  // keep dark mode in sync with the system
  useEffect(() => {
    const darkHandler = (match) => {
      dispatch(updateMatchesDarkMode({ matchesDarkMode: match.matches }))
    }

    const match = window.matchMedia('(prefers-color-scheme: dark)') || {}
    dispatch(updateMatchesDarkMode({ matchesDarkMode: match.matches }))

    if (match.addEventListener) {
      match.addEventListener('change', darkHandler)
    }

    return () => {
      if (match.removeEventListener) {
        match.removeEventListener('change', darkHandler)
      }
    }
  }, [dispatch])

  return null
}
