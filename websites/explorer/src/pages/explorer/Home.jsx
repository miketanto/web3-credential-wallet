import React from 'react'
import { Helmet } from 'react-helmet'
import {
  Redirect, Route, Switch, useRouteMatch,
} from 'react-router-dom'

import Address from './Address'
import Block from './Block'
import Blocks from './Blocks'
import Overview from './Overview'
import Transaction from './Transaction'
import Transactions from './Transactions'

export default function ExplorerHome() {
  const { path } = useRouteMatch() // path = /app
  console.log(path)

  return (
    <>
      <Helmet>
        <title>Explorer - iBlock by DLab</title>
      </Helmet>

      <Switch>
        <Route exact sensitive strict path={path}>
          <Overview />
        </Route>
        {/* overview ==> home */}
        <Route exact sensitive strict path={`${path}/overview`}>
          <Redirect from="*" to={path} />
        </Route>
        <Route exact sensitive strict path={`${path}/blocks`}>
          <Blocks />
        </Route>
        <Route exact sensitive strict path={`${path}/txs`}>
          <Transactions />
        </Route>
        {/* These use queries, so remove `exact` and `strict` flags */}
        <Route sensitive path={`${path}/block/:blockNumber`}>
          <Block />
        </Route>
        <Route sensitive path={`${path}/tx/:hash`}>
          <Transaction />
        </Route>
        <Route sensitive path={`${path}/address/:address`}>
          <Address />
        </Route>
        {/* Catch all other urls & redirect to /app */}
        <Route>
          <Redirect from="*" to="/explorer" />
        </Route>
      </Switch>
    </>
  )
}
