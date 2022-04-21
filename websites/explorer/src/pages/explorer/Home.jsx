import React from 'react'
import { Helmet } from 'react-helmet'
import {
  Navigate, Route, Routes,
} from 'react-router-dom'

import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { switchChainForMetaMask } from '../../hooks/web3'
import Address from './Address'
import Block from './Block'
import Blocks from './Blocks'
import Overview from './Overview'
import Transaction from './Transaction'
import Transactions from './Transactions'

export default function ExplorerHome() {
  const { active } = useActiveWeb3React()

  if (active) {
    // Ignore promise for this function
    switchChainForMetaMask()
  }

  return (
    <>
      <Helmet>
        <title>Explorer - iBlock by DLab</title>
      </Helmet>

      <Routes>
        <Route path="/explorer">
          <Route index element={<Overview />} />
          {/* overview ==> home */}
          <Route path="/overview" element={<Navigate to="/" />} />
          <Route path="/blocks" element={<Blocks />} />
          <Route path="/txs" element={<Transactions />} />
          {/* These use queries, so remove `exact` and `strict` flags */}
          <Route path="/block/:blockNumber" element={<Block />} />
          <Route path="/tx/:hash" element={<Transaction />} />
          <Route path="/address/:address" element={<Address />} />
          {/* Catch all other urls & redirect to /app */}
          <Route path="*" element={<Navigate to="/explorer" />} />
        </Route>
      </Routes>
    </>
  )
}
