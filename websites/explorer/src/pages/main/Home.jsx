import React from 'react'
import { Helmet } from 'react-helmet'

import blockIimage from '../../assets/icons/block-I.png'
import uiucQuadImage from '../../assets/background/uiuc-1.jpg'
import blockchainImage from '../../assets/logo/blockchain.png'

export default function MainHome() {
  return (
    <>
      <Helmet>
        <title>iBlock by Disruption Lab</title>
      </Helmet>

      <div className="py-16 px-8 max-w-5xl m-auto">
        <div className="flex flex-col items-center space-y-12">
          <div>
            <img src={blockIimage} className="h-20 w-auto" />
          </div>
          <div className="text-center">
            <div className="text-4xl font-semibold">
              iBlock by the Disruption Lab
            </div>
            <div className="pt-4">
              Premier cutting-edge blockchain ecosystem incubated at the University of Illinois.
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-stretch space-x-6">
          <div className="sm:w-1/3 flex flex-col space-y-4">
            <div className="flex space-x-4">
              <div className="h-8 w-8 bg-alma border border-stone-100 rounded-full shadow-stone-300/80 shadow-lg" />
              <div className="h-8 w-8 bg-illini-blue border border-stone-100 rounded-full shadow-stone-300/80 shadow-lg" />
              <div className="h-8 w-8 bg-illini-orange border border-stone-100 rounded-full shadow-stone-300/80 shadow-lg" />
              <div className="h-8 w-8 bg-industrial border border-stone-100 rounded-full shadow-stone-300/80 shadow-lg" />
              <div className="h-8 w-8 bg-cloud border border-stone-100 rounded-full shadow-stone-300/80 shadow-lg" />
            </div>
            <div className="pt-10 pb-4 px-8 border border-stone-100 rounded-xl shadow-lg text-center">
              <div className="h-16 w-16 m-auto bg-stone-200 border border-stone-100 rounded-full" />
              <div className="py-4">
                <div className="text-lg font-semibold">Disruption Lab</div>
                <div className="text-neutral-400 text-sm">5 credited skills</div>
              </div>
              <div className="pt-10">
                <a href="https://skill.iblockcore.com" className="inline-block py-2 px-5 text-white bg-blue-500 rounded-full">Skills Wallet</a>
              </div>
            </div>
          </div>
          <div className="sm:w-1/3 flex flex-col space-y-4">
            <div className="grow bg-stone-100 border border-stone-100 rounded-xl shadow-stone-300/80 shadow-lg text-center">
              <div className="h-40 sm:h-56 w-full bg-cover bg-center rounded-t-xl" style={{ backgroundImage: `url(${uiucQuadImage})` }} />
              <div className="py-1 text-md font-bold">NFT Marketplace</div>
            </div>
            <div className="p-3 sm:p-4 flex items-center space-x-3 border border-stone-100 rounded-xl shadow-stone-300/80 shadow-lg">
              <div className="font-semibold">Buy & Sell NFTs</div>
              <div className="h-5 w-5 bg-illini-blue border border-stone-100 rounded-full shadow-stone-300/80 shadow-lg" />
              <div className="h-5 w-5 bg-illini-orange border border-stone-100 rounded-full shadow-stone-300/80 shadow-lg" />
            </div>
          </div>
          <div className="sm:w-1/3 flex flex-col">
            <div className="grow p-8 border border-stone-100 rounded-xl shadow-stone-300/80 shadow-lg">
              <div className="py-4 text-center">
                <div className="text-lg font-bold">iBlock Explorer</div>
              </div>
              <div>
                <img src={blockchainImage} className="h-36 sm:h-40 m-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
