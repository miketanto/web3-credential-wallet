import React from 'react'
import { Helmet } from 'react-helmet'

import Box from '../../components/Box'
import Container from '../../components/Container'

export default function Stats() {
  return (
    <>
      <Helmet>
        <title>App - iBlock by DLab</title>
      </Helmet>

      <section className="relative w-full pt-16 md:pt-24 pb-10 overflow-hidden z-20">
        <Container>
          <Box className="flex-1 border-illini-orange/10" noFlex>
            Aesthetic and informative Statistics features are coming in future updates!
          </Box>
        </Container>
      </section>
    </>
  )
}
