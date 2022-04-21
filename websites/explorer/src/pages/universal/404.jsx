import React from 'react'
import { Helmet } from 'react-helmet'

import Box from '../../components/Box'
import Container from '../../components/Container'

export default function PageNotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found!  - iBlock Explorer</title>
      </Helmet>
      <Container>
        <Box className="flex-1" shadow>
          <div className="w-full text-center">
            <h2 className="">Page Not Found!</h2>
          </div>
        </Box>
      </Container>
    </>
  )
}
