import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import web3 from '../../web3'
import Container from '../../components/Container'
import Box from '../../components/Box'
import {
  NFT, NFTMarket, GiesCoin,
} from '../../contracts'
import {
  nftaddress, gcoaddress, nftmarketaddress,
} from '../../configs/contracts/contract_config'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const navgiate = useNavigate()
  const [web3Accounts, setWeb3Accounts] = useState([])

  useEffect(() => {
    const init = async () => {
      const accounts = await web3.eth.getAccounts()
      setWeb3Accounts(accounts)
    }
    init()
  }, [])

  async function onFileChange(e) {
    const file = e.target.files[0]
    console.log(file)
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`),
        },
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  async function createSale(url) {
    /* next, create the item */
    let transaction = await NFT.methods.createToken(url).send({ from: web3Accounts[0] })
    const event = transaction.events.Transfer
    const value = event.returnValues.tokenId
    const tokenId = Number(value)
    console.log(tokenId)
    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    /* then list the item for sale on the marketplace */
    let listingPrice = await NFTMarket.methods.getListingPrice().call()
    listingPrice = listingPrice.toString()
    console.log(listingPrice)
    transaction = await GiesCoin.methods.approve(nftmarketaddress, listingPrice).send({ from: web3Accounts[0] })
    transaction = await NFTMarket.methods.createMarketItem(nftaddress, tokenId, price).send({ from: web3Accounts[0] })
    console.log(transaction)
    navigate('/marketplace/')
  }

  async function createMarket() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl,
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }
  return (
    <section className="relative w-full h-auto overflow-hidden z-20">
      <Container className="items-center justify-center">
        <Box className="border-illini-orange-100 w-full max-w-sm sm:max-w-md md:max-w-lg justify-self-center" noFlex rounded="2xl">
          <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
              <input
                placeholder="Asset Name"
                className="mt-8 border rounded p-4"
                onChange={(e) => updateFormInput({ ...formInput, name: e.target.value })}
              />
              <textarea
                placeholder="Asset Description"
                className="mt-2 border rounded p-4"
                onChange={(e) => updateFormInput({ ...formInput, description: e.target.value })}
              />
              <input
                placeholder="Asset Price in GCO"
                className="mt-2 border rounded p-4"
                onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
              />
              <input
                type="file"
                name="Asset"
                className="my-4"
                onChange={onFileChange}
              />
              {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} alt="nftimage" />
          )
        }
              <motion.button
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 0.6 },
                }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={createMarket}
                className="font-bold mt-4  bg-gradient-to-r from-blue-300 to-orange-300
               text-white rounded p-4 shadow-lg"
              >
                Create Digital Asset
              </motion.button>
            </div>
          </div>
        </Box>
      </Container>
    </section>

  )
  // const [fileUrl, setFileUrl] = useState(null)
  // const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  // const history = useHistory()
  // const [web3Accounts, setWeb3Accounts] = useState([])
  //
  // useEffect(() => {
  //   const init = async () => {
  //     const accounts = await web3.eth.getAccounts()
  //     setWeb3Accounts(accounts)
  //   }
  //   init()
  // }, [])
  //
  // async function onFileChange(e) {
  //   const file = e.target.files[0]
  //   console.log(file)
  //   try {
  //     const added = await client.add(
  //       file,
  //       {
  //         progress: (prog) => console.log(`received: ${prog}`),
  //       },
  //     )
  //     const url = `https://ipfs.infura.io/ipfs/${added.path}`
  //     setFileUrl(url)
  //   } catch (error) {
  //     console.log('Error uploading file: ', error)
  //   }
  // }
  //
  // async function createSale(url) {
  //   /* next, create the item */
  //   let transaction = await NFT.methods.createToken(url).send({ from: web3Accounts[0] })
  //   const event = transaction.events.Transfer
  //   const value = event.returnValues.tokenId
  //   const tokenId = Number(value)
  //   console.log(tokenId)
  //   const price = ethers.utils.parseUnits(formInput.price, 'ether')
  //
  //   /* then list the item for sale on the marketplace */
  //   let listingPrice = await NFTMarket.methods.getListingPrice().call()
  //   listingPrice = listingPrice.toString()
  //   console.log(listingPrice)
  //   transaction = await GiesCoin.methods.approve(nftmarketaddress, listingPrice).send({ from: web3Accounts[0] })
  //   transaction = await NFTMarket.methods.createMarketItem(nftaddress, tokenId, price).send({ from: web3Accounts[0] })
  //   console.log(transaction)
  //   history.push('/nftMarketplace')
  // }
  //
  // async function createMarket() {
  //   const { name, description, price } = formInput
  //   if (!name || !description || !price || !fileUrl) return
  //   /* first, upload to IPFS */
  //   const data = JSON.stringify({
  //     name, description, image: fileUrl,
  //   })
  //   try {
  //     const added = await client.add(data)
  //     const url = `https://ipfs.infura.io/ipfs/${added.path}`
  //     /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
  //     createSale(url)
  //   } catch (error) {
  //     console.log('Error uploading file: ', error)
  //   }
  // }
  // return (
  //   <div className="flex justify-center">
  //     <div className="w-1/2 flex flex-col pb-12">
  //       <input
  //         placeholder="Asset Name"
  //         className="mt-8 border rounded p-4"
  //         onChange={(e) => updateFormInput({ ...formInput, name: e.target.value })}
  //       />
  //       <textarea
  //         placeholder="Asset Description"
  //         className="mt-2 border rounded p-4"
  //         onChange={(e) => updateFormInput({ ...formInput, description: e.target.value })}
  //       />
  //       <input
  //         placeholder="Asset Price in Eth"
  //         className="mt-2 border rounded p-4"
  //         onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
  //       />
  //       <input
  //         type="file"
  //         name="Asset"
  //         className="my-4"
  //         onChange={onFileChange}
  //       />
  //       {
  //         fileUrl && (
  //           <img className="rounded mt-4" width="350" src={fileUrl} alt="nftimage" />
  //         )
  //       }
  //       <button type="button" onClick={createMarket} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
  //         Create Digital Asset
  //       </button>
  //     </div>
  //   </div>
  // )
}
