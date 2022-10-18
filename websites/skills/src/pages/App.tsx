import React, { ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  Route, Routes,
} from 'react-router-dom'

import ErrorBoundary from '../components/ErrorBoundary'
import Header from '../layouts/Header/index'
import Home from './Home'
import PageNotFound from './PageNotFound'
import Account from './Account'
import AccountHome from './Account/Home'
import Auth from './Auth'
import AuthSignIn from './Auth/SignIn'
import Inbox from './Inbox'
import InboxHome from './Inbox/Home'
import MySkills from './MySkills'
import MySkillsHome from './MySkills/Home'
import Wallet from './Wallet'
import WalletHome from './Wallet/Home'
import ManageSkills from './ManageSkills'
import ManageSkillsHome from './ManageSkills/Home'
import Gallery from './NFTGallery'
import GalleryHome from './NFTGallery/Home'
import RecruiterPage from './RecruiterPage'
import RecruiterPageHome from './RecruiterPage/Home'

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
          <title>iSkills Wallet</title>
          <link rel="canonical" href="https://iblockcore.com" />
        </Helmet>
        <Header />
        <Routes>
          <Route path="*" element={<PageNotFound />} />
          <Route path="/">
            <Route index element={<Home />} />
            <Route path="account" element={<Account />}>
              <Route index element={<AccountHome />} />
            </Route>
            <Route path="auth" element={<Auth />}>
              <Route index element={<AuthSignIn />} />
            </Route>
            <Route path="inbox" element={<Inbox />}>
              <Route index element={<InboxHome />} />
            </Route>
            <Route path="skills" element={<MySkills />}>
              <Route index element={<MySkillsHome />} />
            </Route>
            <Route path="manage" element={<ManageSkills />}>
              <Route index element={<ManageSkillsHome />} />
            </Route>
            <Route path="wallet" element={<Wallet />}>
              <Route index element={<WalletHome />} />
            </Route>
            <Route path="nftgallery" element={<Gallery />}>
              <Route index element={<GalleryHome />} />
            </Route>
            <Route path="recruiterpage" element={<RecruiterPage />}>
              <Route index element={<RecruiterPageHome />} />
            </Route>
          </Route>
        </Routes>
        {/* <Footer /> */}
      </AppWrapper>
    </ErrorBoundary>
  )
}
