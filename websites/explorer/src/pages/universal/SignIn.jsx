import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import React from 'react'
import { Helmet } from 'react-helmet'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route } from 'react-router-dom'

import MicrosoftLogo from '../../assets/logo/microsoft.svg'
import Box from '../../components/Box'
import Container from '../../components/Container'
import Pill from '../../components/Pill'
import { selectIsAuthenticated, signIn } from '../../states-new/auth'

function SignIn() {
  // const ShowPermissionRevokeLinks = () => (
  //   <div>
  //     <div><a href="https://myapps.microsoft.com" target="_blank" rel="noopener noreferrer">Revoke AAD permission</a></div>
  //     <div><a href="https://account.live.com/consent/manage" target="_blank" rel="noopener noreferrer">Revoke Consumer permission</a></div>
  //   </div>
  // )
  const { instance } = useMsal()
  const dispatch = useDispatch()

  /**
   * Use Both to make sure that user is auth'ed or not. In the delay between Sign In button click and Azure
   *  redirect, selectIsAuthenticated returns `true` so we need to guard against that. (Or fix the early-true issue)
   */
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAzureAuthenticated = useIsAuthenticated()

  console.log(`Authenticated: ${isAuthenticated} || Is Azure Authenticated: ${isAzureAuthenticated}`)
  if (isAuthenticated && isAzureAuthenticated) return <Route path="*" element={<Navigate to="/account" />} />

  return (
    <>
      <Helmet>
        <title>Login - iBlock Explorer</title>
      </Helmet>
      {/* <section className="max-w-3xl px-4 m-auto mt-10 text-sm sm:text-md"> */}
      <Container className="space-y-8">
        <Box className="items-center space-y-4" shadow size="lg">
          <div>
            <div className="sr-only">Login Header</div>
            <div className="text-illini-blue text-xl font-bold">Welcome Back!</div>
          </div>
          <div>
            <div className="sr-only">Login Body</div>
            <button type="button" onClick={() => dispatch(signIn(instance))}>
              <Pill
                background="white"
                className="flex items-center px-5 hover:bg-industrial border border-industrial text-lg font-bold shadow transition"
                color="industrial"
                hoverBackground="industrial"
                hoverColor="white"
                rounded="sm"
              >
                <div className="h-7 w-7 mr-3"><img src={MicrosoftLogo} alt="Microsoft" /></div>
                <div>Sign In</div>
              </Pill>
            </button>
          </div>
          <div>
            <div className="sr-only">Login Footer</div>
            <div className="text-gray-400 font-semibold">(Please enable popup if blocked)</div>
          </div>
        </Box>
        {
          // <Box className="items-center space-y-4" shadow size="lg">
          //   <div>
          //     <div className="text-illini-blue text-lg font-bold">Benefits of Signing In:</div>
          //   </div>
          // </Box>
        }
      </Container>
    </>
  )
}

export default SignIn
