import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'
import clsx from 'clsx'
import { utils } from 'ethers'
import React, { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import Modal from 'react-bootstrap/Modal'
import HashLoader from 'react-spinners/HashLoader'
import PacmanLoader from 'react-spinners/PacmanLoader'
import PulseLoader from 'react-spinners/PulseLoader'

type ProcessStep = {
  number: number;
  children: string | ReactElement | ReactElement[];
  isShown?: boolean;
  isComplete?: boolean;
}

interface MintActionProgress {
  associate: boolean
  custodial: boolean
  mint: boolean
}

interface MintModalProgress {
  mintError: boolean
  mintProgress: boolean
}

function ProcessStep({
  number, children, isShown = false, isComplete = false,
} : ProcessStep): ReactElement {
  return (
    <div className={clsx(!isShown && 'hidden', isComplete && 'opacity-40', 'py-6 text-neutral-500 text-md')}>
      <div className="text-illini-blue text-xl font-bold uppercase">{`Step ${number}`}</div>
      <div className="pt-2">{children}</div>
    </div>
  )
}

function SignInButton() {
  const { loginWithRedirect } = useAuth0()
  return <button type="button" onClick={() => loginWithRedirect()} className="btn btn-primary">Sign In</button>
}

function SignOutButton() {
  const { logout } = useAuth0()
  return <button type="button" onClick={() => logout({ returnTo: window.location.origin })} className="btn btn-primary">Sign Out</button>
}

export default function Mint() {
  const [showSteps, setShowSteps] = useState<boolean[]>([true, false, false])
  const [completeSteps, setCompleteSteps] = useState<boolean[]>([false, false, false])
  const [accessToken, setAccessToken] = useState<string>()
  const [mintAddress, setMintAddress] = useState<string>('')
  const [mintResult, setMintResult] = useState<string>('')

  const [inProgress, setInProgress] = useState<MintActionProgress>({
    associate: false,
    custodial: false,
    mint: false,
  })
  const [showModal, setShowModal] = useState<MintModalProgress>({
    mintError: false,
    mintProgress: false,
  })

  const {
    user, isAuthenticated, isLoading, getAccessTokenSilently,
  } = useAuth0()
  // const [userMetadata, setUserMetadata] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) return
    const getAccessToken = async () => {
      const domain = process.env.REACT_APP_AUTH0_DOMAIN
      try {
        const accessTokenAuth0 = await getAccessTokenSilently({
          audience: `https://${domain}/api/v2/`,
          scope: 'openid profile email',
        })
        setAccessToken(accessTokenAuth0)
        // const userDetailsByIdUrl = `https://${domain}/api/v2/users/${user?.sub}`
        // const metadataResponse = await fetch(userDetailsByIdUrl, {
        //   headers: {
        //     Authorization: `Bearer ${accessToken}`,
        //   },
        // })
        // const { user_metadata } = await metadataResponse.json()
        // setUserMetadata(user_metadata)
      } catch (err) {
        console.error(err)
      }
    }

    getAccessToken()
  }, [getAccessTokenSilently, user?.sub])

  useEffect(() => {
    if (isAuthenticated) {
      setShowSteps([true, true, false])
      setCompleteSteps([true, false, false])
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!accessToken) return

    // Check if user is already associated, if so skip to step 3
    const config = { headers: { Authorization: `Bearer ${accessToken}` } }
    axios.get('https://api.iblockcore.com/summit/get-associated', config)
      .then((res) => res?.data)
      .then((data) => {
        const { address } = data.payload
        if (!address || address === '') return
        setShowSteps([true, true, true])
        setCompleteSteps([true, true, false])
        setMintAddress(address)
      })
      .catch(console.error)
  }, [accessToken])

  const mintToken = () => {
    if (!accessToken || inProgress.mint || completeSteps[2]) return

    const address = mintAddress.trim()
    if (!utils.isAddress(address)) {
      console.log(address)
      console.log('Invalid address!')
      return
    }

    const config = { headers: { Authorization: `Bearer ${accessToken}` } }

    setInProgress({ ...inProgress, mint: true })
    axios.post('https://api.iblockcore.com/summit/mint', {}, config)
      .then((res) => res?.data)
      .then((data) => {
        const { transaction: tx } = data.payload
        setInProgress({ ...inProgress, mint: false })
        setCompleteSteps([true, true, true]) // just keep showing mint page

        if (tx === 'already-minted') {
          setMintResult('already-minted')
        } else {
          setMintResult(tx)
        }
      })
      .catch(console.error)
  }

  // Associate address with signed in email
  const associateAddress = () => {
    if (!accessToken || inProgress.associate || completeSteps[1]) return
    const data = { address: mintAddress }
    const config = { headers: { Authorization: `Bearer ${accessToken}` } }

    setInProgress({ ...inProgress, associate: true })
    axios.post('https://api.iblockcore.com/summit/associate', data, config)
      .then((res) => res?.data)
      .then((data) => {
        setInProgress({ ...inProgress, associate: false })
        setShowSteps([true, true, true])
        setCompleteSteps([true, true, false])
      })
      .catch(console.error)
  }

  // Generate custodial address for signed in email
  const custodialAddress = () => {
    if (!accessToken || inProgress.custodial || completeSteps[1]) return
    const config = { headers: { Authorization: `Bearer ${accessToken}` } }

    setInProgress({ ...inProgress, custodial: true })
    axios.get('https://api.iblockcore.com/summit/custodial', config)
      .then((res) => res?.data)
      .then((data) => {
        setMintAddress(data.payload.address)
        setInProgress({ ...inProgress, custodial: false })
      })
      .catch(console.error)
  }

  if (isLoading) {
    return (
      <div className="bg-stone-100">
        <div className="pt-20 pb-4 px-8 max-w-5xl m-auto">
          <div className="max-w-2xl m-auto pb-4 text-center">
            <div className="py-12">
              <HashLoader color="#1D58A7" loading size={50} />
            </div>
            <div className="text-xl text-industrial font-bold">Loading signed in user data...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-stone-100">
        <div className="py-12 px-8 max-w-5xl m-auto">
          <div className="max-w-2xl m-auto pb-4 text-center">
            <div className="text-illini-orange text-3xl font-bold">Mint the Summit NFT!</div>
          </div>
          <div className="max-w-2xl m-auto py-6 text-center">
            <ProcessStep number={1} isShown={showSteps[0]} isComplete={completeSteps[0]}>
              <div className="max-w-md m-auto">Sign in with the email account that you&lsquo;ve used for registration.</div>
              <div className="pt-4">
                {isAuthenticated && <div className="pb-2 font-semibold">Signed in!</div>}
                {!isAuthenticated && <SignInButton />}
                {isAuthenticated && <SignOutButton />}
              </div>
            </ProcessStep>
            <ProcessStep number={2} isShown={showSteps[1]} isComplete={completeSteps[1]}>
              <div className="max-w-md m-auto">Associate your Ethereum address. If you don&lsquo;t have one, we can create a custodial wallet for you!</div>
              <div className="pt-4 flex flex-col items-center space-y-4">
                <div className="form-control w-full max-w-md">
                  <label className="label">
                    <span className="label-text">ETH Address</span>
                    <span className="label-text-alt">(Polygon)</span>
                  </label>
                  <input
                    type="text"
                    className={clsx('w-full input input-bordered input-primary', (inProgress.custodial || completeSteps[1]) && 'input-disabled')}
                    placeholder="Your ETH address here!"
                    onChange={(e) => {
                      if (inProgress.custodial || completeSteps[1]) return
                      setMintAddress(e.target.value)
                    }}
                    value={mintAddress}
                  />
                </div>
                <div className="w-full max-w-md flex space-x-4">
                  <button type="button" className={clsx('grow btn btn-accent', (inProgress.associate || completeSteps[1]) && 'btn-disabled')} onClick={associateAddress}>
                    <span className={clsx(inProgress.associate && 'hidden')}>Associate</span>
                    <PulseLoader color="#eee" loading={inProgress.associate} size={10} />
                  </button>
                  <button type="button" className={clsx('grow btn btn-accent', (inProgress.custodial || completeSteps[1]) && 'btn-disabled')} onClick={custodialAddress}>
                    <span className={clsx(inProgress.custodial && 'hidden')}>Create Custodial</span>
                    <PulseLoader color="#eee" loading={inProgress.custodial} size={10} />
                  </button>
                </div>
              </div>
            </ProcessStep>
            {/* <ProcessStep number={3} isShown={showSteps[2]} isComplete={completeSteps[2]}> */}
            <ProcessStep number={3} isShown={showSteps[2]} isComplete={false}>
              <div>Mint the NFT to your address on Polygon!</div>
              <div className="py-4">
                <button type="button" className={clsx('btn btn-primary', (inProgress.mint || completeSteps[2]) && 'btn-disabled')} onClick={mintToken}>
                  <span className={clsx(inProgress.mint && 'hidden')}>Mint Summit NFT</span>
                  <PulseLoader color="#eee" loading={inProgress.mint} size={10} />
                </button>
              </div>
              <div className={clsx('py-4', mintResult === '' && 'hidden')}>
                {
                  mintResult === 'already-minted' ? (
                    <>
                      <div className="pb-4">Already Minted!</div>
                      <a className="text-sky-500 underline" href={`https://opensea.io/${mintAddress}`} target="_blank" rel="noreferrer">View your NFT here!</a>
                    </>
                  ) : (
                    <>
                      <div className="pb-4">The explorer takes some time to show the transaction. Please wait!</div>
                      <a className="text-sky-500 underline" href={`https://polygonscan.com/tx/${mintResult}`} target="_blank" rel="noreferrer">{`Explorer: tx/${mintResult}`}</a>
                    </>
                  )
                }
              </div>
            </ProcessStep>
          </div>
        </div>
      </div>
      {
        // <Modal
        //   show={showModal.mintError}
        //   onHide={() => setShowModal({ ...showModal, mintError: false })}
        //   backdrop="static"
        //   keyboard={false}
        // >
        //   <Modal.Header closeButton>
        //     <Modal.Title>Mint Error!</Modal.Title>
        //   </Modal.Header>
        //   <Modal.Body>
        //     I will not close if you click outside me. Don&lsquo;t even try to press
        //     escape key.
        //   </Modal.Body>
        //   <Modal.Footer>
        //     <button type="button" className="btn btn-primary" onClick={() => setShowModal({ ...showModal, mintError: false })}>Close</button>
        //   </Modal.Footer>
        // </Modal>
      }
    </>
  )
}
