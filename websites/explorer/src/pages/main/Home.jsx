import React from 'react'
import { Helmet } from 'react-helmet'

import blockIimage from '../../assets/icons/block-I.png'
import uiucQuadImage from '../../assets/background/uiuc-1.jpg'
import blockchainImage from '../../assets/logo/blockchain.png'
import summitNFT from '../../assets/logo/summit-2022.png'

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

        <div className="mt-16 flex flex-col sm:flex-row items-stretch space-y-6 md:space-x-6">
          <div className="sm:w-1/3 flex flex-col space-y-4">
            <div className="flex space-x-4">
              <div className="h-8 w-8 bg-alma border border-stone-100 rounded-full shadow-stone-300/80 shadow-lg" />
              <div className="h-8 w-8 bg-illini-blue border border-stone-100 rounded-full shadow-stone-300/80 shadow-lg" />
              <div className="h-8 w-8 bg-illini-orange border border-stone-100 rounded-full shadow-stone-300/80 shadow-lg" />
              <div className="h-8 w-8 bg-industrial border border-stone-100 rounded-full shadow-stone-300/80 shadow-lg" />
              <div className="h-8 w-8 bg-cloud border border-stone-100 rounded-full shadow-stone-300/80 shadow-lg" />
            </div>
            <div className="grow pt-10 pb-4 px-8 border border-stone-100 rounded-xl shadow-lg text-center">
              <div className="h-16 w-16 m-auto bg-stone-200 border border-stone-100 rounded-full" />
              <div className="py-4">
                <div className="text-lg font-semibold">Disruption Lab</div>
                <div className="text-neutral-400 text-sm">5 credited skills</div>
              </div>
              <div className="pt-10">
                <a href="https://skill.iblockcore.com" className="inline-block py-2 px-5 text-white bg-blue-500 rounded-full shadow-stone-300/80 shadow-lg">Skills Wallet</a>
              </div>
            </div>
          </div>
          <div className="sm:w-1/3 flex flex-col space-y-4">
            <div className="grow bg-stone-100 border border-stone-200 rounded-xl shadow-stone-300/80 shadow-lg text-center">
              <div className="h-72 sm:h-56 w-full bg-cover bg-center rounded-t-xl" style={{ backgroundImage: `url(${uiucQuadImage})` }} />
              <div className="py-1 text-md font-bold">NFT Marketplace</div>
            </div>
            <div className="p-3 flex items-center space-x-3 border border-stone-100 rounded-xl shadow-stone-300/80 shadow-lg">
              <div className="h-6 w-6 bg-illini-blue border border-stone-100 rounded-full shadow-stone-300/80 shadow-lg" />
              <div className="h-6 w-6 bg-illini-orange border border-stone-100 rounded-full shadow-stone-300/80 shadow-lg" />
              <div className="grow" />
              <div>
                <a href="https://skill.iblockcore.com" className="inline-block py-1 px-3 text-white bg-illini-orange rounded-full shadow-stone-300/80 shadow-lg">Buy & Sell NFTs</a>
              </div>
            </div>
          </div>
          <div className="sm:w-1/3 flex flex-col">
            <div className="grow p-8 pb-4 border border-stone-100 rounded-xl shadow-stone-300/80 shadow-lg">
              <div className="pt-2 pb-4 text-center">
                <div className="text-lg font-bold">iBlock Explorer</div>
              </div>
              <div>
                <img src={blockchainImage} className="h-40 m-auto" />
              </div>
              <div className="pt-6 text-center">
                <a href="https://skill.iblockcore.com" className="inline-block py-2 px-5 text-white bg-blue-500 rounded-full shadow-stone-300/80 shadow-lg">Explore Now</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-stone-100">
        <div className="py-16 px-8 max-w-5xl m-auto">
          <div className="max-w-2xl m-auto text-center">
            <div className="py-4">
              <img src={summitNFT} className="h-40 sm:h-52 w-auto m-auto" />
            </div>
            <div className="pt-4 text-alma text-3xl font-bold">Blockchain Summit 2022</div>
            <div className="pt-2 text-neutral-500 text-md">The first annual blockchain summit gathering the best of the blockchain ecosystem around University of Illinois to celebrate and share its progressions.</div>
            <div className="pt-8 pb-4 text-center">
              <a href="https://summit.iblockcore.com" className="inline-block py-4 px-6 text-white text-lg font-semibold bg-blue-500 rounded-full shadow-stone-300/80 shadow-lg">Join the Summit</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
