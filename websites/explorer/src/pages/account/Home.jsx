import { InteractionStatus } from '@azure/msal-browser'
import {
  AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated, useMsal,
} from '@azure/msal-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressBook, faUser } from '@fortawesome/free-regular-svg-icons'
import { faSignOutAlt, faSlidersH, faWallet } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useDispatch, useSelector } from 'react-redux'
import {
  Link, Navigate, Route, Routes, useNavigate,
} from 'react-router-dom'

import Box from '../../components/Box'
import Container from '../../components/Container'
import {
  getAccessToken,
  selectAccessToken, selectIsAuthenticated, selectUserAccount, signOut,
} from '../../states-new/auth'
import getFromCoreAPI from '../../utils/getFromCoreAPI'
import MyAddresses from './Addresses'
import MyProfile from './Profile'
import MySettings from './Settings'

/* eslint-disable react/prop-types */
const AccountMenu = ({ children }) => (
  <Box shadow size="minimal" className="flex-initial" style={{ minWidth: '20rem' }}>
    {children}
  </Box>
)

const AccountBodyWrapper = ({ children }) => (<Box shadow className="grow px-3">{children}</Box>)
/* eslint-enable react/prop-types */

const AccountMenuItem = ({
  children, className, icon, text, to,
}) => {
  const roundedClass = 'first:rounded-t last:rounded-b'
  const classNames = clsx(
    'flex flex-row',
    'text-industrial hover:bg-industrial-100 border-b last:border-0 border-gray-100 transition cursor-pointer',
    roundedClass,
    className,
  )
  const style = { minWidth: '220px' }
  const iconComp = icon ? <div className="w-8" style={{ fontSize: '1.2em' }}><FontAwesomeIcon icon={icon} /></div> : ''

  if (to) {
    return (
      <Link to={to} className={clsx('py-3 px-5', classNames)} style={style}>
        { iconComp }
        <div>{text}</div>
      </Link>
    )
  }
  return (
    <div className={classNames} style={style}>{children}</div>
  )
}

AccountMenuItem.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  icon: PropTypes.any,
  text: PropTypes.string,
  to: PropTypes.string,
}

AccountMenuItem.defaultProps = {
  children: null,
  className: '',
  icon: null,
  text: '',
  to: '',
}

function AuthorizedPage() {
  const { instance, accounts, inProgress } = useMsal()
  const isAzureAuthenticated = useIsAuthenticated()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const accessToken = useSelector(selectAccessToken)
  const userAccount = useSelector(selectUserAccount)
  const [addresses, setAddresses] = useState([])
  const [balances, setBalances] = useState({})

  useEffect(() => {
    try {
      dispatch(getAccessToken({
        accounts, isAzureAuthenticated, inProgress, instance,
      }))
    } catch (err) {
      dispatch(signOut(instance))
    }
  }, [accounts])

  // TODO: call it only once by moving it to Redux store
  useEffect(() => {
    console.log(addresses.length)
    if (!accessToken || !userAccount || !userAccount.username || addresses.length) return
    const config = { params: { net_id: userAccount.username.split('@')[0] } }

    getFromCoreAPI('/address/associated', config)
      .then(({ payload }) => setAddresses(payload.addresses))
  }, []) // [userAccount.username]

  // useEffect(() => {
  //   if (!accessToken) return
  //   const config = { headers: { Authorization: `Bearer ${accessToken}` } }
  //
  //   getFromCoreAPI('/address/associated', config)
  //     .then(({ payload }) => setAddresses(payload.addresses))
  // }, [accessToken])

  useEffect(() => {
    addresses.forEach((address) => {
      getFromCoreAPI('/address/getBalance', { params: { address } })
        .then(({ payload }) => setBalances({ ...balances, [address]: payload.balance }))
    })
  }, [addresses])

  if (!isAuthenticated && !isAzureAuthenticated) {
    dispatch(signOut(instance))
    navigate('/signin')
    return <></>
  }

  // Return nothing if still loading
  if (inProgress !== InteractionStatus.None || (inProgress === InteractionStatus.None && accounts.length === 0)) return <></>

  return (
    <div className="flex flex-1 items-start space-x-6">
      <AuthenticatedTemplate>
        <AccountMenu>
          <AccountMenuItem icon={faUser} to="/account" text="My Profile" />
          <AccountMenuItem icon={faAddressBook} to="/account/addresses" text="Addresses" />
          <AccountMenuItem icon={faWallet} to="/app/wallet" text="Wallet" />
          <AccountMenuItem icon={faSlidersH} to="/account/settings" text="Settings" />
          <AccountMenuItem>
            <button type="button" className="flex flex-row text-left w-full py-3 px-5" onClick={() => dispatch(signOut(instance))}>
              <div className="w-8" style={{ fontSize: '1.2em' }}><FontAwesomeIcon icon={faSignOutAlt} /></div>
              <div>Sign Out</div>
            </button>
          </AccountMenuItem>
        </AccountMenu>

        <AccountBodyWrapper>
          <Routes>
            <Route path="/account">
              <Route index element={<MyProfile account={userAccount} />} />
              <Route
                path="/addresses"
                element={<MyAddresses account={userAccount} addresses={addresses} balances={balances} />}
              />
              <Route path="/settings" element={<MySettings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </AccountBodyWrapper>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Route path="*" element={<Navigate to="/login" />} />
      </UnauthenticatedTemplate>
    </div>
  )
}

/**
 * We wrap AuthorizedPage inside Account since MSAL requires any Authenticated-component to be dependent
 *  that is included as a component inside exported component
 */
export default function AccountHome() {
  return (
    <>
      <Helmet>
        <title>My Account - iBlock Explorer</title>
      </Helmet>
      <Container>
        <AuthorizedPage />
      </Container>
    </>
  )
}
