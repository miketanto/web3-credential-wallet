import { ethers } from 'ethers'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'

import FaucetArtifacts from '../../../abis/Faucet.json'
import Box from '../../../components/Box'
import Container from '../../../components/Container'
import { FAUCET_ADDRESS } from '../../../constants/addresses'

export default function InteractFaucet() {
  const [faucetDripped, setFaucetDripped] = useState(0) // 0: idle; 1: call done; 2: calling

  // request access to the user's MetaMask account
  async function requestAccount() {
    if (window.ethereum && window.ethereum.request) return window.ethereum.request({ method: 'eth_requestAccounts' })
    throw new Error(
      'Missing install Metamask. Please access https://metamask.io/ to install extension on your browser',
    )
  }

  async function callFaucet() {
    if (typeof window.ethereum !== 'undefined') {
      setFaucetDripped(2)
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(
        FAUCET_ADDRESS,
        FaucetArtifacts.abi,
        signer,
      )

      const transaction = await contract.drip()
      const res = await transaction.wait()
      console.log('Faucet call response:', res)
      setFaucetDripped(1)
    }
  }

  useEffect(() => {
    if (faucetDripped) {
      setTimeout(() => setFaucetDripped(false), 5000)
    }
  }, [faucetDripped])

  return (
    <>
      <Helmet>
        <title>Faucet App - iBlock by DLab</title>
      </Helmet>
      <Container>
        <Box className="flex-1 border-illini-orange/10" noFlex>
          <div className="py-2">
            <button
              className="btn btn-green mt-1"
              type="button"
              onClick={callFaucet}
            >
              Call Faucet
            </button>
          </div>
          <div className="py-2">
            { faucetDripped === 2 ? 'Faucet is dripping...' : faucetDripped === 1 ? 'Faucet Dripped!' : 'Faucet is idle...' }
          </div>
        </Box>
      </Container>
    </>
  )
}
