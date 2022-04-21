import clsx from 'clsx'
import { Location } from 'history'
import React, {
  lazy, Suspense, useEffect, useState,
} from 'react'
import { Helmet } from 'react-helmet'
import {
  Redirect, Route, Switch, useLocation,
} from 'react-router-dom'

import ErrorBoundary from '../components/ErrorBoundary'
import useRouter from '../hooks/useRouter'
import Header from '../layouts/Header'

/* Page Imports */
const MainHome = lazy(() => import('./main/Home'))
const ExplorerHome = lazy(() => import('./explorer/Home'))

type WrapperProps = {
  children: JSX.Element | JSX.Element[],
}

const AppWrapper = ({ children }: WrapperProps) => (<div className="flex flex-col items-start h-auto min-h-screen w-screen max-w-screen">{children}</div>)

const HeaderWrapper = ({ children }: WrapperProps) => (<div className="flex md:flex-nowrap justify-between w-full t-0 z-50">{children}</div>)

const Loader = () => <span />

export default function App(): JSX.Element {
  const location = useLocation<Location>()

  useRouter(() => {
    window.scrollTo(0, 0)
  })

  const BodyWrapper = ({ children }: WrapperProps) => (
    <div className={clsx('w-full pb-10 z-10')}>
      {children}
    </div>
  )

  return (
    <ErrorBoundary>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="description" content="The Disruption Lab at UIUC presents an industry-leading Proof-of-Authority blockchain system with ERC-20 tokens, ERC-1155 NFT marketplace, and innovative dApps." />
        <title>iBlock at UIUC</title>
        <link rel="canonical" href="https://iblockcore.com" />
      </Helmet>
      <AppWrapper>
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
        <ErrorBoundary>
          <BodyWrapper>
            <Suspense fallback={<Loader />}>
              <Switch>
                <Route exact path="/">
                  <MainHome />
                </Route>
                <Route path="/explorer">
                  <ExplorerHome />
                </Route>
                <Route>
                  <Redirect from="*" to="/" />
                </Route>
              </Switch>
            </Suspense>
          </BodyWrapper>
        </ErrorBoundary>
        {/* {!(isMobile() && mobileMenuVisible) && <Footer />} */}
      </AppWrapper>
    </ErrorBoundary>
  )
}
