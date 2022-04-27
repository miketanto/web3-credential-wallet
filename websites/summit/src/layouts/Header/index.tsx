import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
// import type { Location } from 'react-router-dom'

import blockI from '../../assets/block-I.png'
import Container from '../../components/Container'

export default function Header() {
  const { pathname } = useLocation()
  const [isMintPage, setIsMintPage] = useState<boolean>(false)

  useEffect(() => {
    if (pathname === '/mint') setIsMintPage(true)
    else if (isMintPage) setIsMintPage(false)
  }, [pathname])

  return (
    <nav className="sticky inset-x-0 top-0 w-screen bg-white shadow z-[10000]">
      <Container flexRow className="items-center space-x-6 py-2">
        <section>
          <img src={blockI} className="h-12" />
        </section>
        <section>
          <div className="flex items-center space-x-4 text-illini-blue text-xl font-bold rounded">
            <Link to="/" className="p-2">1st Annual Blockchain Summit</Link>
          </div>
        </section>
        <div className="grow" />
        <section className={clsx(!isMintPage && 'hidden', 'text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-illini-orange to-alma')}>
          !! Minting NFT !!
        </section>
      </Container>
    </nav>
  )
}
