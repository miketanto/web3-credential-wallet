import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-regular-svg-icons'
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
      <AuthenticatedTemplate>
        <div className="px-1">
          <NavItem to="/account" text="Account" />
        </div>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <div className="px-1">
          <NavItem to="/signin" key="" className="flex items-center">
            <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
            <div>Sign In</div>
          </NavItem>
        </div>
      </UnauthenticatedTemplate>
      <div className="pl-1">
        <NavItem to="/app" text="Enter App" className="text-illini-orange hover:bg-illini-orange/20 font-bold uppercase" />
      </div>
    </>
  )
}

function AppMenu() {
  const appNavClass = 'hover:bg-illini-orange/20'
  return (
    <>
      <div className="pr-1">
        <NavItem to="/app/swap" text="Swap" className={appNavClass} />
        <NavItem to="/app/transfer" text="Transfer" className={appNavClass} />
        <NavItem to="/app/interact" text="Interact" className={appNavClass} />
        {
          // <NavItem to="/app/stat" text="Stats" className={appNavClass} />
        }
      </div>
      <div className="px-1 grid-rows-[50%_50%]">
        <NavItem to="/app/wallet" text="Wallet" className={appNavClass} />
        <AuthenticatedTemplate>
          <NavItem to="/myaccount" text="Account" className={appNavClass} />
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <NavItem to="/login" key="" className={clsx('flex items-center', appNavClass)}>
            <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
            <div>Login</div>
          </NavItem>
        </UnauthenticatedTemplate>
      </div>
      <div className="pl-1">
        <NavItem to="/" text="Explorer" className="text-illini-orange bg-inherit hover:bg-illini-orange/20 font-bold uppercase" />
      </div>
    </>
  )
}

function MarketplaceMenu() {
  const appNavClass = 'hover:bg-illini-orange/20'
  return (
    <>
      <div className="pr-1">
        <NavItem to="/marketplace/createNFT" text="Create" className={appNavClass} />
        <NavItem to="/marketplace/" text="Explore" className={appNavClass} />
      </div>
      <div className="px-1 flex flex-row">
        <NavItem to="/app/wallet" text="Wallet" className={appNavClass} />
        <AuthenticatedTemplate>
          <NavItem to="/account" text="Account" className={appNavClass} />
        </AuthenticatedTemplate>
      </div>
      <div className="pl-1">
        <NavItem to="/" text="Explorer" className="text-illini-orange bg-inherit hover:bg-illini-orange/20 font-bold uppercase" />
      </div>
    </>
  )
}

function Header() {
  const location = useLocation()

  const [isApp, setIsApp] = useState<boolean>(false)
  const [isExplorer, setIsExplorer] = useState<boolean>(false)
  const [isExplorerHome, setIsExplorerHome] = useState<boolean>(false)
  // const [isHome, setIsHome] = useState<boolean>(false)
  const [isMarketplace, setIsMarketplace] = useState<boolean>(false)
  const [isMarketExplore, setIsMarketExplore] = useState<boolean>(false)
  const shouldExpand = false

  useEffect(() => {
    setIsApp(location.pathname.startsWith('/app'))
    setIsExplorer(location.pathname.startsWith('/explorer'))
    setIsExplorerHome(location.pathname === '/explorer')
    setIsMarketplace(location.pathname.startsWith('/marketplace'))
    setIsMarketExplore(location.pathname.endsWith('/marketplace'))
  }, [location.pathname])

  return (
    <section
      className={clsx(
        'w-full',
        (isExplorer && !isExplorerHome) && !isApp && !isMarketplace && !isMarketExplore && 'border-b border-gray-100 shadow-cmd',
        (isExplorerHome || isApp) && 'absolute',
      )}
    >
      <nav className="w-full">
        <div className="flex items-center justify-right max-w-6xl xl:max-w-8xl m-auto p-4">
          <section className="flex flex-initial items-center sm:gap-x-6">
            <div>
              <Link to="/" className="block">
                <img
                  src={UIUCLogo}
                  alt="UIUC Logo (Explorer)"
                  className={clsx('h-6 sm:h-12 w-auto max-w-3xl')}
                />
              </Link>
            </div>
            {
              isApp && (
                <div>
                  <Link to="/app" className="relative block">
                    <Pill
                      className="relative text-cloud bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-semibold uppercase z-20"
                      shadow
                      size="sm"
                      rounded="md"
                      text="Decentralized"
                    />
                  </Link>
                </div>
              )
            }
            {
              isMarketplace && (
                <div>
                  <Link to="/marketplace/" className="relative block">
                    <Pill
                      className="relative text-cloud bg-gradient-to-r from-orange-500 via-blue-500 to-indigo-100 font-semibold uppercase z-20"
                      shadow
                      size="sm"
                      rounded="md"
                      text="Marketplace"
                    />
                  </Link>
                </div>
              )
            }
            {
              // shouldExpand ? (
              //   <div>
              //     Price
              //   </div>
              // ) : ''
            }
          </section>
          <div className={clsx('lg:flex-1', !isExplorer && !isApp && 'px-4 sm:px-6 md:px-10 text-sm sm:text-md')}>
            <SearchBar className={clsx(!isMarketExplore && 'hidden')} />
          </div>
          <Pill
            color={isExplorer || isApp ? 'illini-blue' : 'gray-600'}
            className={clsx(
              'flex-initial grid grid-flow-col auto-cols-max px-1 divide-x border border-gray-100 font-semibold',
              isApp && 'bg-illini-orange/10 border-illini-orange/5 divide-illini-orange/10',
              isMarketplace && 'bg-illini-orange/10 border-illini-orange/5 divide-illini-orange/10',
            )}
            dropShadow={isExplorerHome}
            size="sm"
          >
            {
              isApp ? <AppMenu /> : (isMarketplace ? <MarketplaceMenu /> : <ExplorerMenu />)
            }
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
