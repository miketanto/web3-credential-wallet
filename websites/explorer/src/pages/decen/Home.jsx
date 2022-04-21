import React from 'react'
import { Helmet } from 'react-helmet'
import {
  Navigate, Route, Routes,
} from 'react-router-dom'

import Container from '../../components/Container'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { switchChainForMetaMask } from '../../hooks/web3'
import Interact from './Interact'
import Transfer from './Transfer'
import Swap from './Swap'
import Wallet from './Wallet'

export default function DecentralizedAppHome() {
  const { active } = useActiveWeb3React()

  if (active) {
    // Ignore promise for this function
    switchChainForMetaMask()
  }

  return (
    <>
      <Helmet>
        <title>App - iBlock by DLab</title>
      </Helmet>

      <section className="relative w-full pt-16 md:pt-24 pb-10 overflow-hidden z-20">
        <Container className="justify-start items-center space-y-4">
          <Routes>
            <Route path="/app">
              <Route index element={<Swap />} />
              {/* swap ==> home */}
              <Route path="/swap" element={<Navigate to="/" />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/interact" element={<Interact />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="*" element="/" />
            </Route>
          </Routes>
        </Container>
      </section>
    </>
  )
}
