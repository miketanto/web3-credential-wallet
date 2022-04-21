/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react'
import web3 from '../../web3'
import axios from 'axios'
import Header from '../../layouts/marketplace/Header'
import Modal from '../../components/Modal'
import { loadUserNFTs } from './nftFunctions'
import PersonalItem from '../../components/PersonalItem'
// import Modal from '../../components/Modal'

export default function NFTDashboard() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [web3Accounts, setWeb3Accounts] = useState([])
  const [currModal, setCurrModal] = useState()
  const [showModal, toggle] = useState(false)

  function toggleModal() {
    setTimeout(toggle(true), 1000)
  }
  useEffect(() => {
    const init = async () => {
      const accounts = await web3.eth.getAccounts()
      loadUserNFTs(accounts[0]).then((items) => {
        setNfts(items)
        setLoadingState('loaded')
      })
      setWeb3Accounts(accounts)
    }
    init()
  }, [])
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return (
    <div>
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: '1600px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                // eslint-disable-next-line react/jsx-no-bind
                <PersonalItem nft={nft} setCurrModal={setCurrModal} toggleModal={toggleModal} />
              ))
            }
          </div>
        </div>
      </div>
      { (showModal) ? (
        <Modal
          currModal={currModal}
          toggle={toggle}
          account={web3Accounts[0]}
        />
      ) : null }
    </div>
  )
  // const [nfts, setNfts] = useState([])
  // const [loadingState, setLoadingState] = useState('not-loaded')
  // const [web3Accounts, setWeb3Accounts] = useState([])
  //
  // async function loadNFTs(account) {
  //   const data = await NFTMarket.methods.fetchMyNFTs().call({ from: account })
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
  //   // const soldItems = items.filter((i) => i.sold)
  //   // setSold(soldItems)
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
  // async function sellNft(nft) {
  //   const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
  //   let transaction = await GiesCoin.methods.approve(nftmarketaddress, price).send({ from: web3Accounts[0] })
  //   transaction = await NFTMarket.methods.createMarketSale(nftaddress, nft.itemId).send({ from: web3Accounts[0] })
  //   loadNFTs()
  // }
  // // if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  // return (
  //   <div>
  //     <div className="flex justify-center">
  //       <div className="px-4" style={{ maxWidth: '1600px' }}>
  //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
  //           {
  //             nfts.map((nft, i) => (
  //               <div key={i} className="border shadow rounded-xl overflow-hidden">
  //                 <img src={nft.image} />
  //                 <div className="p-4">
  //                   <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
  //                   <div style={{ height: '70px', overflow: 'hidden' }}>
  //                     <p className="text-gray-400">{nft.description}</p>
  //                   </div>
  //                 </div>
  //                 <div className="p-4 bg-black">
  //                   <p className="text-2xl mb-4 font-bold text-white">
  //                     {nft.price}
  //                     {' '}
  //                     EMO
  //                   </p>
  //                   <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => sellNft(nft)}>Sell</button>
  //                 </div>
  //               </div>
  //             ))
  //           }
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // )
}
