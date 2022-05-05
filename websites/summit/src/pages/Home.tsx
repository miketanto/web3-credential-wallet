import React from 'react'
// import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

import summitNFT from '../assets/summit-2022.png'

export default function Home() {
  return (
    <>
      <div />
      <div className="bg-stone-100">
        <div className="py-12 px-8 max-w-5xl m-auto">
          <div className="max-w-2xl m-auto text-center">
            <div className="py-4">
              <img src={summitNFT} className="h-40 sm:h-52 w-auto m-auto" />
            </div>
            <div className="pt-4 text-alma text-3xl font-bold">Thanks for attending the Summit!</div>
            <div className="pt-2 text-neutral-500 text-md">We hope that the first annual Summit has been a great experience for you! As we strive to spread the blockchain ecosystem to the people, we wish to have you back for our next Summit!</div>
            <div className="pt-4 text-neutral-500 text-md">Contact us or write a feedback!</div>
            <div className="pt-4 text-neutral-500 text-md">As our gesture of gratitude for your attendance, we are minting the exclusive Summit NFT! Click below to continue.</div>
            <div className="pt-6 pb-4 text-center">
              <Link to="/mint" className="inline-block py-4 px-6 text-white text-lg font-semibold bg-blue-500 rounded-full shadow-stone-300/80 shadow-lg">Get the Summit NFT</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
