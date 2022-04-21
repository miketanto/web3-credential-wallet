import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import UIUCLogo from '../../assets/logo/uiuc-white.png'
import Pill from '../../components/Pill'
import SearchBar from '../../components/SearchBar'

interface NavItemProps {
  children?: JSX.Element | JSX.Element[] | null,
  className?: string | null,
  to: string,
  text?: string | null,
}

const NavItem = ({
  children, className, to, text,
}: NavItemProps) => (
  <Link to={to}>
    <Pill
      className={clsx('inline-block py-1 bg-inherit hover:bg-cloud-100 transition', className)}
      text={text}
    >
      {children}
    </Pill>
  </Link>
)

NavItem.defaultProps = {
  children: null,
  className: null,
  text: null,
}

function ExplorerMenu() {
  return (
    <>
      <div className="pr-1">
        {/* <NavItem to="/" text="Home" /> */}
        <NavItem to="/explorer" text="Explorer" />
        <NavItem to="/explorer/blocks" text="Blocks" />
        <NavItem to="/explorer/txs" text="Transactions" />
      </div>
    </>
  )
}

function Header() {
  const location = useLocation()

  const [isHome, setIsHome] = useState<boolean>(false)
  const [isExplorer, setIsExplorer] = useState<boolean>(false)
  const [isExplorerHome, setIsExplorerHome] = useState<boolean>(false)

  useEffect(() => {
    setIsHome(location.pathname === '/')
    setIsExplorer(location.pathname.startsWith('/explorer'))
    setIsExplorerHome(location.pathname === '/explorer')
  }, [location.pathname])

  if (isHome) return (<></>)

  return (
    <section
      className={clsx(
        'w-full',
        (isExplorer && !isExplorerHome) && 'border-b border-gray-100 shadow-cmd',
        (isExplorerHome) && 'absolute',
      )}
    >
      <nav className="w-full">
        <div className="flex items-center justify-right max-w-6xl xl:max-w-8xl m-auto p-4">
          <section className="flex flex-initial items-center sm:gap-x-6">
            <div>
              <Link to="/explorer" className="block">
                <img
                  src={UIUCLogo}
                  alt="UIUC Logo (Explorer)"
                  className={clsx('h-6 sm:h-12 w-auto max-w-3xl')}
                />
              </Link>
            </div>
          </section>
          <div className={clsx('lg:flex-1 px-4 sm:px-6 md:px-10 text-sm sm:text-md')}>
            <SearchBar className={clsx(isExplorerHome && 'hidden')} />
          </div>
          <Pill
            color={isExplorer ? 'illini-blue' : 'gray-600'}
            className={clsx(
              'flex-initial grid grid-flow-col auto-cols-max px-1 divide-x border border-gray-100 font-semibold',
            )}
            dropShadow={isExplorerHome}
            size="sm"
          >
            <ExplorerMenu />
          </Pill>
        </div>
      </nav>

      {/* <section className="flex items-center max-w-7xl px-4 m-auto text-sm sm:text-md justify-center"> */}
      {/*  <SearchBar /> */}
      {/* </section> */}
    </section>
  )
}

export default Header
