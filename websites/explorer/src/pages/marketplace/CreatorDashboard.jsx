/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import axios from 'axios'
import { abi } from '../../contracts/contracts/NFTMarket.json'
import {
  nftmarketaddress, nftaddress,
} from '../../configs/contracts/contract_config'

import { NFTMarket, NFT } from '../../contracts'

export default function CreatorDashboard() {
  // const [nfts, setNfts] = useState([])
  // const [sold, setSold] = useState([])
  // const [loadingState, setLoadingState] = useState('not-loaded')
  // const [web3Accounts, setWeb3Accounts] = useState([])
  //
  // async function loadNFTs(account) {
  //   console.log(account)
  //   const data = await NFTMarket.methods.fetchItemsCreated().call({ from: account })
  //   console.log(data)
  //   const items = await Promise.all(data.map(async (i) => {
  //     const tokenUri = await NFT.methods.tokenURI(i.tokenId).call()
  //     console.log(tokenUri)
  //     console.log(i.seller)
  //     const meta = await axios.get(tokenUri)
  //     const price = ethers.utils.formatUnits(i.price.toString(), 'ether')
  //     const item = {
  //       price,
  //       tokenId: Number(i.tokenId),
  //       seller: i.seller,
  //       owner: i.owner,
  //       sold: i.sold,
  //       image: meta.data.image,
  //     }
  //     return item
  //   }))
  //   /* create a filtered array of items that have been sold */
  //   const soldItems = items.filter((i) => i.sold)
  //   setSold(soldItems)
  //   setNfts(items)
  //   setLoadingState('loaded')
  // }
  //
  // useEffect(async () => {
  //   const init = async () => {
  //     const accounts = await web3.eth.getAccounts()
  //     loadNFTs(accounts[0])
  //     setWeb3Accounts(accounts)
  //   }
  //   init()
  // }, [])
  //
  // if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets created</h1>)
  // return (
  //   <div>
  //     <div className="p-4">
  //       <h2 className="text-2xl py-2">Items Created</h2>
  //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
  //         {
  //           nfts.map((nft, i) => (
  //             <div key={i} className="border shadow rounded-xl overflow-hidden">
  //               <div className="h-72 overflow-hidden">
  //                 <img src={nft.image} className="rounded h-full" alt="NFT" />
  //               </div>
  //               <div className="p-3 flex-auto bg-black">
  //                 <p className="text-2xl font-bold text-white">
  //                   Price -
  //                   {' '}
  //                   {nft.price}
  //                   {' '}
  //                   GCO
  //                 </p>
  //               </div>
  //             </div>
  //           ))
  //         }
  //       </div>
  //     </div>
  //     <div className="px-4">
  //       {
  //         Boolean(sold.length) && (
  //           <div>
  //             <h2 className="text-2xl py-2">Items sold</h2>
  //             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
  //               {
  //                 sold.map((nft, i) => (
  //                   <div key={i} className="border shadow rounded-xl overflow-hidden">
  //                     <div className="h-72 overflow-hidden">
  //                       <img src={nft.image} className="rounded h-full" alt="NFT" />
  //                     </div>
  //                     <div className="p-3 flex-auto bg-black">
  //                       <p className="text-2xl font-bold text-white">
  //                         Price -
  //                         {' '}
  //                         {nft.price}
  //                         {' '}
  //                         GCO
  //                       </p>
  //                     </div>
  //                   </div>
  //                 ))
  //               }
  //             </div>
  //           </div>
  //         )
  //       }
  //     </div>
  //   </div>
  // )
}
