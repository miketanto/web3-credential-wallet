import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import { Helmet } from 'react-helmet'

import Box from '../../components/Box'

export default function Swap() {
  return (
    <>
      <Helmet>
        <title>Swap - iBlock by DLab</title>
      </Helmet>

      <Box className="border-illini-orange-100 w-full max-w-sm sm:max-w-md md:max-w-lg" noFlex rounded="2xl">
        <div className="py-2">
          <div className="text-xl font-extrabold">Swap</div>
        </div>
        <div className="flex flex-col items-center py-2 text-illini-blue text-xl">
          <div className="relative w-full">
            <input
              type="text"
              name="price"
              id="price"
              className="block w-full py-4 pl-6 pr-12 bg-illini-orange-100 border border-transparent hover:border-illini-orange-400 focus:border-illini-orange-400 outline-0 font-semibold rounded-2xl transition"
              placeholder="0.0"
            />
            {
              // <div className="absolute inset-y-0 right-0 flex items-center">
              //   <select
              //     id="currency"
              //     name="currency"
              //     className="focus:ring-indigo-500 focus:border-indigo-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
              //   >
              //     <option>USD</option>
              //     <option>CAD</option>
              //     <option>EUR</option>
              //   </select>
              // </div>
            }
          </div>
          <div className="-mt-3 z-20">
            <div className="flex items-center justify-center h-10 w-10 text-indigo-500 bg-indigo-100 border-4 border-white text-lg rounded-full">
              <FontAwesomeIcon icon={faArrowDown} />
            </div>
          </div>
          <div className="w-full -mt-3">
            <input
              type="text"
              name="price"
              id="price"
              className="block w-full py-4 pl-6 pr-12 bg-illini-orange-100 border border-transparent hover:border-illini-orange-400 focus:border-illini-orange-400 font-semibold outline-0 rounded-2xl transition"
              placeholder="0.0"
            />
          </div>
          <div className="w-full pt-3">
            <button
              className="w-full p-3 text-indigo-600 bg-indigo-100 border border-transparent hover:bg-indigo-200 font-semibold rounded-2xl transition"
              type="button"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </Box>
    </>
  )
}
