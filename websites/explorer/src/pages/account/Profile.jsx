import PropTypes from 'prop-types'
import React from 'react'

function MyProfile({ account }) {
  // console.log(account)
  if (!account || !account.name) return <></>
  const [lastName, firstName] = account.name.split(',')
  return (
    <>
      <div className="py-2 px-4 bg-gray-100 rounded">
        <div className="text-lg font-bold">Profile</div>
      </div>

      <div className="py-2 px-4">
        <div className="py-2">
          <div className="font-bold">Name</div>
          <div>{`${firstName} ${lastName}`}</div>
        </div>

        <div className="py-2">
          <div className="font-bold">Email</div>
          <div>{account.username}</div>
        </div>
      </div>
    </>
  )
}

MyProfile.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  account: PropTypes.any,
}

MyProfile.defaultProps = {
  account: null,
}

export default MyProfile
