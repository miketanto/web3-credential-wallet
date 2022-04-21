/* eslint-disable react/prop-types */
/* eslint-disable react/button-has-type */
import React from 'react'
import { motion } from 'framer-motion'
import { loadMarketNFTs, buyNft } from '../../pages/marketplace/nftFunctions'

function MarketItem({
  nft, setNfts, setLoadingState, web3Accounts,
}) {
  return (
    <div className="border shadow rounded-xl overflow-hidden h-80 w-64 grid grid-rows-[80%_20%]">
      <div className="flex h-full w-full max-h-full max-w-full justify-center align-center">
        <img src={nft.image} alt="nftImage" />
      </div>
      <div className="grid grid-cols-[50%_50%] h-full w-full max-h-full max-w-full justify-center align-center">
        <div className="pl-4 flex flex-col h-full w-full max-h-full max-w-full justify-center align-center">
          <div>
            <p className="text-lg font-semibold">{nft.name}</p>
          </div>
          <p className="text-lgfont-bold text-black">
            {nft.price}
            {' '}
            GCO
          </p>
        </div>
        <div className="flex h-full w-full items-center justify-center">
          <motion.button
            whileHover={{
              scale: 1.1,
              backgroundColor: 'orange',
              transition: { duration: 0.6 },
            }}
            whileTap={{ scale: 0.9 }}
            className=" h-4/5 w-8/12 w-full bg-orange-500 text-white rounded shadow-lg font-bold text-center"
            onClick={() => {
              buyNft(nft, web3Accounts).then((items) => {
                setNfts(items)
                setLoadingState('loaded')
              })
            }}
          >
            Buy

          </motion.button>
        </div>
      </div>
    </div>

  )
}

export default MarketItem
