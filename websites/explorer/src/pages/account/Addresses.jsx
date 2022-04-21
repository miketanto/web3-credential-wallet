import { utils as ethUtils } from 'ethers/lib/ethers'
import PropTypes from 'prop-types'
import React from 'react'
import { Helmet } from 'react-helmet'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import Pill from '../../components/Pill'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { selectAccessToken } from '../../states-new/auth'
import postToCoreAPI from '../../utils/postToCoreAPI'

function MyAddresses({ account: userAccount, addresses, balances }) {
  const { account } = useActiveWeb3React()
  const accessToken = useSelector(selectAccessToken)

  const associateAccount = () => {
    if (!userAccount || !accessToken) return
    if (!account) {
      toast.error('Connect to your wallet first!')
      return
    }

    const data = { address: account }
    const config = { headers: { Authorization: `Bearer ${accessToken}` } }
    try {
      postToCoreAPI('/address/associate', data, config)
        .then((res) => {
          toast.success('Associated the address! You will receive some ALMA in a moment!')
        })
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <>
      <Helmet>
        <title>My Addresses - iBlock Explorer</title>
      </Helmet>

      <div className="py-2 px-4 bg-gray-100 rounded">
        <div className="text-lg font-bold">Associated Address</div>
      </div>

      <div className="py-2 px-4">
        {
          addresses && addresses.length ? (
            <div className="flex space-y-4 py-2">
              {
                addresses.map((address) => (
                  <div className="flex space-x-4" key={address}>
                    <div>
                      <Link to={`/address/${address}`} className="text-industrial hover:text-industrial-300">{address}</Link>
                    </div>
                    <div>{`${ethUtils.formatEther(balances[address] || '0')} ETH` || 'Loading balance...'}</div>
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="flex space-y-4 py-2">
              You don&rsquo;t have any address associated to your account!
            </div>
          )
        }
      </div>

      <div className="flex flex-col py-2 px-4 space-y-4">
        {
          !account && (
            <div>
              <Link to="/app/wallet" className="inline-block">
                <Pill
                  className="text-indigo-500 border border-indigo-500 hover:text-white hover:bg-indigo-500 font-semibold transition"
                  text="First, Connect wallet"
                />
              </Link>
            </div>
          )
        }
        <div className="flex flex-col space-y-2">
          <div>
            <button type="button" onClick={associateAccount}>
              <Pill
                className="text-altgeld border border-illini-orange hover:text-white hover:bg-illini-orange font-semibold transition"
                text={`${!account ? 'Then, ' : ''}Associate account`}
              />
            </button>
          </div>
          {
            account && (
              <div>
                <span>For account</span>
                <Link to={`/address/${account}`} className="ml-2 text-industrial hover:underline font-semibold">{account}</Link>
              </div>
            )
          }
        </div>
      </div>
    </>
  )
}

/* eslint-disable react/forbid-prop-types */
MyAddresses.propTypes = {
  account: PropTypes.any,
  addresses: PropTypes.array.isRequired,
  balances: PropTypes.object.isRequired,
}
/* eslint-enable react/forbid-prop-types */

MyAddresses.defaultProps = {
  account: null,
}

export default MyAddresses
