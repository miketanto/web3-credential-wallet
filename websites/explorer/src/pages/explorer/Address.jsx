import { formatDistanceToNowStrict } from 'date-fns'
import { utils as ethUtils } from 'ethers'
import hljs from 'highlight.js'
import hljsDefineSolidity from 'highlightjs-solidity'
import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useParams } from 'react-router-dom'
import Web3 from 'web3'
import Web3Utils from 'web3-utils'

import Box from '../../components/Box'
import Container from '../../components/Container'
import Pill from '../../components/Pill'
import { getContractCode } from '../../states/api'
import { useGetBalanceOfAddress } from '../../states-new/slices/addressAPI'
import getFromCoreAPI from '../../utils/getFromCoreAPI'

const { formatEther } = ethUtils

class Highlight extends React.Component {
  constructor(props) {
    super(props)
    this.setEl = this.setEl.bind(this)
    hljsDefineSolidity(hljs)
    hljs.initHighlightingOnLoad()
  }

  componentDidMount() {
    this.highlightCode()
  }

  componentDidUpdate() {
    this.highlightCode()
  }

  setEl(el) {
    this.el = el
  }

  highlightCode() {
    const nodes = this.el.querySelectorAll('pre code')

    for (let i = 0; i < nodes.length; i++) {
      hljs.highlightBlock(nodes[i])
    }
  }

  render() {
    const {
      // eslint-disable-next-line react/prop-types
      children, className, element: Element, innerHTML,
    } = this.props
    const props = { ref: this.setEl, className }

    if (innerHTML) {
      props.dangerouslySetInnerHTML = { __html: children }
      if (Element) {
        return <Element {...props} />
      }
      return <div {...props} />
    }

    if (Element) {
      return <Element {...props}>{children}</Element>
    }
    // return <pre ref={this.setEl}><code className={className}>{children}</code></pre>
    return <pre ref={this.setEl}><code className="solidity text-xs">{children}</code></pre>
  }
}

Highlight.defaultProps = {
  innerHTML: false,
  className: null,
  element: null,
}

export default function Home() {
  const [transactions, setTransactions] = useState()
  const [web3, setWeb3] = useState()
  const [isContract, setIsContract] = useState(false)
  const [contractCode, setContractCode] = useState()
  const [balance, setBalance] = useState(0)
  const { address } = useParams()

  // const { balance, balanceError, balanceIsLoading } = useGetBalanceOfAddress(address)

  useEffect(() => {
    // MetaMask is active
    if (window.ethereum) setWeb3(new Web3(window.ethereum))
    else setWeb3(new Web3(process.env.REACT_APP_WEB3_URL))
  }, [window.ethereum])

  useEffect(() => {
    getFromCoreAPI('/address/get-balance', { params: { address } })
      .then(({ payload }) => setBalance(payload.balance))
  }, [address])

  useEffect(() => {
    if (!web3 || !web3.eth || !Web3Utils.isAddress(address)) return setIsContract(false)

    return web3.eth
      .getCode(address)
      .then((bytecode) => {
        // console.log(bytecode)
        if (!bytecode || bytecode === '0x' || bytecode === '0x0') {
          setIsContract(false)
          setContractCode(null)
        } else {
          setIsContract(true)
          setContractCode(getContractCode(address))
        }
      })
      .catch((err) => {
        // mostly when address is an invalid one (ie. doesn't exist)
        console.log(err)
        setIsContract(false)
        setContractCode(null)
      })
  }, [web3, address])

  useEffect(() => {
    const config = {
      params: {
        address,
        per_page: 20,
        page: 1,
      },
    }
    getFromCoreAPI('/tx/get-by-address', config).then(({ payload }) => {
      const nonEmpty = payload.transactions.transactions.filter((tx) => tx.hash && tx.from && tx.to)
      setTransactions(nonEmpty)
    })
  }, [address])

  return (
    <>
      <Helmet>
        <title>{`${address}  - iBlock Explorer`}</title>
      </Helmet>
      <Container>
        <div className="flex-1 py-2 px-2">
          <Box shadow>
            <div className="pb-2 mb-2 text-lg text-illini-blue border-b border-gray-300 flex">
              <div className="font-bold">
                Address
              </div>
              <div className="mx-2">
                {address}
              </div>
            </div>

            <div className="flex items-center pb-2 mb-2 text-md text-illini-blue border-b border-gray-300">
              <Pill className="bg-cloud-100">
                {`${isContract ? 'Contract' : 'Human'}`}
              </Pill>
              <Pill className="bg-cloud-100 mx-4">
                {`Balance: ${formatEther(String(balance))} ETH`}
              </Pill>
            </div>

            {
              contractCode && (
                <div className="pb-2 mb-2 text-lg text-illini-blue border-b border-gray-300 flex">
                  <Highlight>{contractCode}</Highlight>
                </div>
              )
            }

            {
              // <table className="w-full">
              //   <tbody>
              //   {
              //     address ? (
              //       <tr className="border-b last:border-0 hover:bg-gray-50 font-bold text-illini-blue">
              //         <td className="p-3">Balance</td>
              //         <td className="p-3 text-industrial-300">
              //           {`${address.balance} ${address.unit}`}
              //         </td>
              //       </tr>
              //     ) : 'Loading address...'
              //   }
              //   </tbody>
              // </table>
            }
          </Box>
        </div>
      </Container>

      <Container>
        <div className="flex-1 py-2 px-2">
          <Box shadow>
            <div className="pb-2 mb-2 text-lg font-bold text-illini-blue border-b border-gray-300">
              Transactions
            </div>
            <table className="w-full">
              <thead className="text-md font-bold text-left text-illini-blue border-b border-gray-300 pb-1">
                <tr>
                  <th className="p-1">Hash</th>
                  {/* <th */}
                  {/*  className="p-1" */}
                  {/*  role="button" */}
                  {/*  onClick={() => setUseDate(!useDate)} */}
                  {/* > */}
                  {/*  <div className="ml-2 hover:text-industrial"> */}
                  {/*    { */}
                  {/*      useDate ? 'Date' : 'Age' */}
                  {/*    } */}
                  {/*  </div> */}
                  {/* </th> */}
                  <th className="p-1">From</th>
                  <th className="p-1">To</th>
                  <th className="p-1">Gas Price</th>
                  <th className="p-1 pr-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {
                  transactions ? transactions.map((transaction) => (
                    <tr key={transaction.hash} className="py-2 border-b border-gray-200 last:border-0 hover:bg-gray-50">
                      <td className="p-1">
                        <Link to={`/explorer/tx/${transaction.hash}`} className="p-1 text-industrial-300 hover:text-industrial font-bold text-cursor">{`${String(transaction.hash).substring(0, 15)}...`}</Link>
                        <div className="mt-1 ml-1 text-xs text-gray-500">
                          {transaction.blockNumber}
                        </div>
                      </td>
                      {/* <td className="p-1"> */}
                      {/*  <div> */}
                      {/*    <a className="ml-2 hover:text-industrial"> */}
                      {/*      { */}
                      {/*        // transaction.timestamp */}
                      {/*        // useDate ? format(fromUnixTime(transaction.timestamp), 'Pp') */}
                      {/*        //   : `${formatDistanceToNowStrict(fromUnixTime(transaction.timestamp))} ago` */}
                      {/*        `${formatDistanceToNowStrict(new Date(transaction.timestamp), { includeSeconds: true })} ago` */}
                      {/*      } */}
                      {/*    </a> */}
                      {/*  </div> */}
                      {/* </td> */}
                      <td className="p-1 text-industrial-300">
                        <span className="sr-only">Tx address from</span>
                        <Link to={`/explorer/address/${transaction.from}`} className="ml-2 hover:text-industrial">{`${String(transaction.from).substring(0, 15)}...`}</Link>
                      </td>
                      <td className="p-1 text-industrial-300">
                        <span className="sr-only">Tx address to</span>
                        <Link to={`/explorer/address/${transaction.to}`} className="ml-2 hover:text-industrial">{`${String(transaction.to).substring(0, 15)}...`}</Link>
                      </td>
                      <td className="p-1">{transaction.gasPrice}</td>
                      <td className="p-1 pr-4 text-right">
                        <div className="inline-block py-1 px-2 bg-cloud text-industrial rounded-sm">{`${formatEther(transaction.value)} ETH`}</div>
                      </td>
                    </tr>
                  )) : 'Loading transactions...'
                }
              </tbody>
            </table>
          </Box>
        </div>
      </Container>
    </>
  )
}
