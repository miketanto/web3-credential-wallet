import React from 'react'
import { Helmet } from 'react-helmet-async'

export default function PageNotFound() {
  return (
    <>
      <Helmet>
        <title>iSkills - 404</title>
      </Helmet>
      <div>
        Page Not Found!
      </div>
    </>
  )
}
