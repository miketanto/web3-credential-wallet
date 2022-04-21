import React from 'react'
import { Helmet } from 'react-helmet'

function MySettings() {
  return (
    <>
      <Helmet>
        <title>My Settings - iBlock Explorer</title>
      </Helmet>

      <div className="py-2 px-4 bg-gray-100 rounded">
        <div className="text-lg font-bold">Settings</div>
      </div>

      <div className="py-2 px-4">
        <div className="py-2">
          <div className="font-bold">Exciting options coming in future updates!</div>
        </div>
      </div>
    </>
  )
}

export default MySettings
