/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react'
<<<<<<< HEAD
import web3 from '../../web3'
=======
import axios from 'axios'
>>>>>>> main
import NFTHeader from '../../layouts/marketplace/Header'
import { loadMarketNFTs, buyNft } from './nftFunctions'
import MarketItem from '../../components/MarketItem'

export default function NFTMarketplace() {
<<<<<<< HEAD
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [web3Accounts, setWeb3Accounts] = useState([])

  useEffect(() => {
    const init = async () => {
      const accounts = await web3.eth.getAccounts()
      setWeb3Accounts(accounts)
      await loadMarketNFTs().then((items) => {
        setNfts(items)
        setLoadingState('loaded')
      })
    }
    init()
  }, [])

  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <MarketItem nft={nft} setNfts={setNfts} setLoadingState={setLoadingState} web3Accounts={web3Accounts} />
            ))
          }
        </div>
      </div>
    </div>
  )
=======
  // const [nfts, setNfts] = useState([])
  // const [loadingState, setLoadingState] = useState('not-loaded')
  // const [web3Accounts, setWeb3Accounts] = useState([])
  //
  // async function loadNFTs() {
  //   const data = await NFTMarket.methods.fetchMarketItems().call()
  //
  //   const items = await Promise.all(data.map(async (i) => {
  //     const tokenUri = await NFT.methods.tokenURI(i.tokenId).call()
  //     const meta = await axios.get(tokenUri)
  //     const price = ethers.utils.formatUnits(i.price.toString(), 'ether')
  //     const item = {
  //       price,
  //       itemId: Number(i.itemId),
  //       seller: i.seller,
  //       owner: i.owner,
  //       image: meta.data.image,
  //       name: meta.data.name,
  //       description: meta.data.description,
  //     }
  //     return item
  //   }))
  //   setNfts(items)
  //   setLoadingState('loaded')
  // }
  //
  // useEffect(() => {
  //   const init = async () => {
  //     const accounts = await web3.eth.getAccounts()
  //     setWeb3Accounts(accounts)
  //     loadNFTs()
  //   }
  //   init()
  // }, [])
  //
  // async function buyNft(nft) {
  //   const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
  //   let transaction = await GiesCoin.methods.approve(nftmarketaddress, price).send({ from: web3Accounts[0] })
  //   transaction = await NFTMarket.methods.createMarketSale(nftaddress, nft.itemId).send({ from: web3Accounts[0] })
  //   loadNFTs()
  // }
  // if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  // return (
  //   <div className="w-screen min-h-screen bg-gray-100 overflow-x-hidden">
  //     <div className="flex justify-center">
  //       <div className="px-4" style={{ maxWidth: '1600px' }}>
  //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
  //           {
  //           nfts.map((nft, i) => (
  //             <div key={i} className="border shadow rounded-xl overflow-hidden">
  //               <img src={nft.image} />
  //               <div className="p-4">
  //                 <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
  //                 <div style={{ height: '70px', overflow: 'hidden' }}>
  //                   <p className="text-gray-400">{nft.description}</p>
  //                 </div>
  //               </div>
  //               <div className="p-4 bg-black">
  //                 <p className="text-2xl mb-4 font-bold text-white">
  //                   {nft.price}
  //                   {' '}
  //                   GCO
  //                 </p>
  //                 <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
  //               </div>
  //             </div>
  //           ))
  //         }
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // )
>>>>>>> main
}
