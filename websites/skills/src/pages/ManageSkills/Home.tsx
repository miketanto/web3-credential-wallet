import { useMsal } from '@azure/msal-react'
import axios from 'axios'
import {
  providers, utils, BigNumberish, Contract,
} from 'ethers'
import React, { useEffect, useState } from 'react'
import { useInput } from 'rooks'

import { SkillsWalletABI, SkillsWalletAddress } from '../../constants/contracts'
import Container from '../../components/Container'
import { useContract } from '../../hooks/useContract'

export default function ManageSkillsHome() {
  const { instance, accounts } = useMsal()
  const [accessToken, setAccessToken] = useState<string>()

  const contract = useContract(SkillsWalletAddress, SkillsWalletABI)

  const [credentialerCount, setCredentialerCount] = useState<string>()

  const skillNameInput = useInput('Excellence in Math')
  const [skillDescriptionInput, setSkillDescriptionInput] = useState<string>('This student excels in mathematical creativity and goes above and beyond to understand the theoretical aspects of math as well.')

  const issueSkillId = useInput('5')
  const issueSkillEmail = useInput('jwp6@illinois.edu')

  // let provider = null
  // useEffect(() => {
  //   if (typeof window.ethereum !== 'undefined') {
  //     // Ethereum user detected. You can now use the provider.
  //     provider = window.ethereum
  //     console.log('metamask found')
  //   }
  //   provider.enable()
  //     .then(() => {
  //       const ethersProvider = new providers.Web3Provider(provider)
  //       const contract = new Contract(SkillsWalletAddress, SkillsWalletABI, ethersProvider.getSigner())
  //       const transaction = contract.addCredentialer('0x19656Ac6e17F3A10e403710FDeC414B89131e70A')
  //       console.log(transaction)
  //     })
  //     .catch((error) => {
  //       // Handle error. Likely the user rejected the login
  //       console.error(error)
  //     })
  // })

  const request = {
    scopes: ['User.Read'],
    account: accounts[0],
  }

  useEffect(() => {
    // Silently acquires an access token which is then attached to a request for Microsoft Graph data
    instance.acquireTokenSilent(request)
      .then((res) => {
        setAccessToken(res.accessToken)
      })
      .catch((e) => {
        instance.acquireTokenPopup(request).then((res) => {
          setAccessToken(res.accessToken)
        })
      })
  }, [])

  useEffect(() => {
    if (!contract) return
    contract.getCredentialerCount()
      .then((data: BigNumberish) => {
        // console.log(data)
        setCredentialerCount(data.toString())
      })

    // contract.isCredentialer('0xD6142AA031B333f5233762e59926a8fb189c54Fc')
    //   .then((data: any) => {
    //     console.log(data)
    //   })
  }, [])

  function handleTextareaChange(event: any) {
    setSkillDescriptionInput(event.target.value)
  }

  function createSkill() {
    console.log(skillNameInput.value)
    console.log(skillDescriptionInput)
    const name = skillNameInput.value.trim()
    const description = skillDescriptionInput.trim()
    if (!accessToken || !name || !description) return

    const config = { headers: { Authorization: `Bearer ${accessToken}` } }
    const bodyParams = { name, description }

    axios.post('http://localhost:4000/v2/skill/create', bodyParams, config)
      .then((res) => res?.data)
      .then(console.log)
      .catch(console.error)
  }

  function issueSkill() {
    const email = issueSkillEmail.value.trim()
    const skillId = issueSkillId.value.trim()
    if (!accessToken || !email || !skillId) return

    const config = { headers: { Authorization: `Bearer ${accessToken}` } }
    const bodyParams = { email, credential_id: skillId }

    axios.post('http://localhost:4000/v2/skill/mint', bodyParams, config)
      .then((res) => res?.data)
      .then(console.log)
      .catch(console.error)
  }

  return (
    <Container className="pt-10">
      <div className="text-2xl text-center font-semibold">
        Manage Skills
      </div>
      <div className="mt-8 p-4 bg-white rounded-lg shadow-xl">
        <div>
          Credentialer count:
          {' '}
          {credentialerCount}
        </div>
      </div>
      <div className="mt-8 p-4 bg-white rounded-lg shadow-xl">
        <div>
          Create a new Skill NFT
        </div>
        <div className="flex flex-col w-full space-y-4">
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Skill Name</span>
              {/* <span className="label-text-alt">Alt label</span> */}
            </label>
            <input type="text" className="input input-accent w-full max-w-xs" placeholder="Type here" {...skillNameInput} />
          </div>
          <div className="form-control w-full max-w-xl">
            <label className="label">
              <span className="label-text">Skill Description</span>
              {/* <span className="label-text-alt">Alt label</span> */}
            </label>
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <textarea className="textarea textarea-bordered h-24" placeholder="Description" value={skillDescriptionInput} onChange={handleTextareaChange} />
            {/* <label className="label"> */}
            {/*  <span className="label-text-alt">Your bio</span> */}
            {/*  <span className="label-text-alt">Alt label</span> */}
            {/* </label> */}
          </div>
          <div className="form-control w-full max-w-xs">
            <button type="button" className="btn btn-accent" onClick={() => createSkill()}>Create</button>
          </div>
        </div>
      </div>
      <div className="mt-8 p-4 bg-white rounded-lg shadow-xl">
        <div>
          Issue a Skill NFT
        </div>
        <div className="flex flex-col w-full max-w-xs space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Skill ID</span>
              {/* <span className="label-text-alt">Alt label</span> */}
            </label>
            <input type="text" className="input input-primary w-full max-w-xs" placeholder="Type here" {...issueSkillId} />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Receiver</span>
              <span className="label-text-alt">Email</span>
            </label>
            <input type="text" className="input input-primary w-full max-w-xs" placeholder="Type here" {...issueSkillEmail} />
          </div>
          <div className="form-control">
            <button type="button" className="btn btn-primary" onClick={() => issueSkill()}>Issue</button>
          </div>
        </div>
      </div>
    </Container>
  )
}
