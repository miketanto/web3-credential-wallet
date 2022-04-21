import clsx from 'clsx'
import React from 'react'
import { Helmet } from 'react-helmet'
import {
  Link, Navigate, Route, Routes,
} from 'react-router-dom'

import Box from '../../components/Box'
import Pill from '../../components/Pill'
import InteractFaucet from './interactions/Faucet'
import InteractGreeter from './interactions/Greeter'

const NavItem = ({
  // eslint-disable-next-line react/prop-types
  children = null, className = null, to, text,
}) => (
  <Link to={to}>
    <Pill
      className={clsx('inline-block py-1 bg-inherit hover:bg-cloud-100 transition', className)}
      rounded="lg"
      size="lg"
      text={text}
    >
      {children}
    </Pill>
  </Link>
)

export default function Interact() {
  const appNavClass = 'hover:bg-illini-orange/20'

  return (
    <>
      <Helmet>
        <title>Interact - iBlock by DLab</title>
      </Helmet>

      <Box className="border-illini-orange-100 text-lg divide-x divide-illini-orange-200" noFlex rounded="lg" size="sm">
        <NavItem to="/app/interact" text="Faucet" className={appNavClass} />
        <NavItem to="/app/interact/greeter" text="Greeter" className={appNavClass} />
        <NavItem to="/app/interact/ctf" text="Capture The Flag" className={appNavClass} />
      </Box>

      <Routes>
        {/* path = /account */}
        <Route path="/app/interact">
          <Route index element={<InteractFaucet />} />
          {/* faucet ==> home */}
          <Route path="/faucet" element={<Navigate to="/" />} />
          <Route path="/greeter" element={<InteractGreeter />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </>
  )
}
