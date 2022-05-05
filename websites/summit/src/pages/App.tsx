import React, { ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  Route, Routes,
} from 'react-router-dom'

import ErrorBoundary from '../components/ErrorBoundary'
import Header from '../layouts/Header/index'
import Home from './Home'
import Mint from './Mint'
import PageNotFound from './PageNotFound'

function AppWrapper({ children }: { children: ReactNode }) {
  return <div className="w-screen min-h-screen bg-stone-100 dark:bg-black text-black dark:text-white">{children}</div>
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppWrapper>
        <Helmet>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="utf-8" />
          <meta name="description" content="The Disruption Lab at UIUC presents an industry-leading decentralized app for verifiable student records." />
          <title>UIUC Blockchain Summit 2022</title>
          <link rel="canonical" href="https://summit.iblockcore.com" />
        </Helmet>
        <Header />
        <Routes>
          <Route path="*" element={<PageNotFound />} />
          <Route path="/">
            <Route index element={<Home />} />
            <Route path="mint" element={<Mint />} />
          </Route>
        </Routes>
        {/* <Footer /> */}
      </AppWrapper>
    </ErrorBoundary>
  )
}
