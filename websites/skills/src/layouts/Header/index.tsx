import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react'
import clsx from 'clsx'
import React, { ElementType } from 'react'
import {
  IoHome, IoLogInOutline, IoMail, IoPerson, IoWallet,
} from 'react-icons/io5'
import { useAuth0 } from '@auth0/auth0-react'
import { MdSpaceDashboard } from 'react-icons/md'
import { NavLink } from 'react-router-dom'

import Container from '../../components/Container'

function NavItem({ text, to, icon }: { text: string, to: string, icon: ElementType }) {
  const NavItemIcon = icon
  return (
    <div className="flex flex-col justify-center pt-1">
      <NavLink
        to={to}
        // when route is active, below is applied
        className={({ isActive }) => clsx(isActive ? 'text-illini-blue cursor-default' : 'text-stone-400', 'hover:text-illini-blue transition')}
      >
        <div><NavItemIcon className="m-auto text-2xl" /></div>
        <div className="text-xs">{text}</div>
      </NavLink>
    </div>
  )
}

export default function Header() {
  const {
    user, isAuthenticated, isLoading, getAccessTokenSilently,
  } = useAuth0()
  return (
    <nav className="sticky inset-x-0 top-0 w-screen bg-white shadow">
      <Container flexRow className="items-center py-2">
        <section>
          <div className="py-1 px-3 text-white bg-illini-blue text-xl font-bold rounded">iSkills Wallet</div>
        </section>
        <div className="grow" />
        {isAuthenticated?
        <section className="flex flex-row items-center space-x-6">
          <NavItem
            text="Home"
            to="/"
            icon={IoHome}
          />
            <NavItem
            text="My Skills"
            to="/skills"
            icon={MdSpaceDashboard}
          />
          <NavItem
            text="Manage Skills"
            to="/manage"
            icon={MdSpaceDashboard}
          />
          <NavItem
            text="Account"
            to="/account"
            icon={IoPerson}
          /> </section>:
            <NavItem
            text="Sign In"
            to="/auth"
            icon={IoLogInOutline}
          />
        }
       
      </Container>
    </nav>
  )
}
