import { ethers } from 'ethers'
import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import toast, { Toaster } from 'react-hot-toast'

import GreeterArtifacts from '../../../abis/Greeter.json'
import SampleTokenArtifacts from '../../../abis/SampleToken.json'
import { ALMA_ADDRESS, GREETER_ADDRESS } from '../../../constants/addresses'

export default function InteractGreeter() {
  const [greeting, setGreetingValue] = useState('')
  const [userAddress, setUserAddressValue] = useState('')
  const [amount, setAmountValue] = useState(0)

  // request access to the user's MetaMask account
  async function requestAccount() {
    if (window.ethereum && window.ethereum.request) return window.ethereum.request({ method: 'eth_requestAccounts' })
    throw new Error(
      'Missing install Metamask. Please access https://metamask.io/ to install extension on your browser',
    )
  }

  // call the smart contract, read the current greeting value
  async function fetchGreeting() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(
        GREETER_ADDRESS,
        GreeterArtifacts.abi,
        provider,
      )
      try {
        const data = await contract.greet()
        toast.success(`Greeting: ${data}`)
      } catch (err) {
        toast.error(`Error: ${err}`)
      }
    }
  }

  // call the smart contract, send an update
  async function setGreeting() {
    if (!greeting) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(
        GREETER_ADDRESS,
        GreeterArtifacts.abi,
        signer,
      )

      const transaction = await contract.setGreeting(greeting)
      await transaction.wait()
      fetchGreeting()
    }
  }

  // get balance of the token contract
  async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(
        ALMA_ADDRESS,
        SampleTokenArtifacts.abi,
        provider,
      )

      // request account from metamask
      const [account] = await requestAccount()
      const balance = await contract.balanceOf(account)
      toast.success(`balance: ${balance.toString()}`)
    }
  }

  // send a transaction to the token contract
  async function sendToken() {
    if (!userAddress || !amount) return

    if (typeof window.ethereum !== 'undefined') {
      // request account from metamask
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(
        ALMA_ADDRESS,
        SampleTokenArtifacts.abi,
        signer,
      )
      const transaction = await contract.transfer(userAddress, amount)
      await transaction.wait()
      getBalance()
    }
  }

  return (
    <>
      <Helmet>
        <title>Greeter App - iBlock by DLab</title>
      </Helmet>
      <div className="flex flex-col justify-center">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="lg:flex md:flex text-xl justify-center items-center mx-auto border-orange-500 max-w-2xl py-4 px-4">
            <div className="font-semibold p-2">
              <span className="text-gray-800">Greeter Contract</span>
              <span className="text-orange-500 mx-1 text-3xl">/</span>
              <a
                href={`https://ropsten.etherscan.io/address/${GREETER_ADDRESS}`}
                target="_blank"
                className="px-4 py-1 rounded-full focus:outline-none bg-orange-500 text-white shadow ml-2"
                rel="noreferrer"
              >
                Check
              </a>
            </div>
          </div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 flex flex-col">
            <div className="flex flex-row flex-wrap">
              <button
                className="btn btn-green mt-1"
                type="button"
                onClick={fetchGreeting}
              >
                Fetch Greeting
              </button>
              <div className="flex flex-row flex-wrap mt-1">
                <input
                  onChange={(e) => setGreetingValue(e.target.value)}
                  type="text"
                  placeholder="Set greeting"
                />
                <button
                  className="btn btn-green ml-1"
                  type="button"
                  onClick={setGreeting}
                >
                  Set Greeting
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="lg:flex md:flex text-xl justify-center items-center mx-auto border-orange-500 max-w-2xl py-4 px-4">
            <div className="font-semibold p-2">
              <span className="text-gray-800">Token Contract</span>
              <span className="text-orange-500 mx-1 text-3xl">/</span>
              <a
                href={`https://ropsten.etherscan.io/address/${ALMA_ADDRESS}`}
                target="_blank"
                className="px-4 py-1 rounded-full focus:outline-none bg-orange-500 text-white shadow ml-2"
                rel="noreferrer"
              >
                Check
              </a>
            </div>
          </div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 flex flex-col">
            <button
              className="btn btn-green mt-1"
              type="button"
              onClick={getBalance}
            >
              Get Balance
            </button>

            <hr className="mt-4" />

            <input
              type="text"
              onChange={(e) => setUserAddressValue(e.target.value)}
              placeholder="User address"
            />
            <input
              type="number"
              onChange={(e) => setAmountValue(Number(e.target.value))}
              placeholder="Amount"
            />
            <button
              className="btn btn-green mt-1"
              type="button"
              onClick={sendToken}
            >
              Send token
            </button>
          </div>
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  )
}
