import { utils as ethUtils } from 'ethers'
import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Link, useParams } from 'react-router-dom'

import Box from '../../components/Box'
import Container from '../../components/Container'
import getFromCoreAPI from '../../utils/getFromCoreAPI'

export default function Home() {
  const [transaction, setTransaction] = useState(null)

  const { hash: txHash } = useParams()

  const desiredKeys = {
    hash: 'Hash',
    block: 'Block Number',
    txIndex: 'Block Tx Index',
    from: 'From',
    to: 'To',
    // gas: 'Max Gas',
    // gasUsed: 'Gas Used',
    gasLimit: 'Gas Limit',
    gasPrice: 'Gas Price',
    input: 'Input',
    // maxFeePerGas: 'Max Fee Per Gas',
    // maxPriorityFeePerGas: 'Max Priority Fee Per Gas',
    nonce: 'Nonce',
    value: 'Value',
  }

  useEffect(() => {
    const config = { params: { key: txHash } }
    getFromCoreAPI('/tx/get', config).then(({ payload }) => setTransaction(payload.transaction))
  }, [])

  const cleanShowRow = (key) => {
    switch (key) {
      case 'block':
        return <Link to={`/explorer/block/${transaction[key]}`} className="text-industrial font-bold hover:text-alma">{transaction[key]}</Link>
      case 'input':
        return transaction[key] || '-'
      case 'to':
      case 'from':
        return <Link to={`/explorer/address/${transaction[key]}`} className="text-industrial font-bold hover:text-alma">{transaction[key]}</Link>
      case 'gasLimit':
      case 'gasPrice':
      case 'value':
        return `${ethUtils.formatEther(transaction[key])} ETH [${transaction[key]} wei]`
      default:
        return transaction[key]
    }
  }

  console.log(transaction)
  return (
    <>
      <Helmet>
        <title>Transaction - iBlock Explorer</title>
      </Helmet>
      <Container>
        <Box className="flex-1" shadow>
          <div className="pb-2 mb-2 text-lg font-bold text-illini-blue border-b border-gray-300">Transaction</div>

          <table className="w-full">
            <tbody>
              {
                transaction ? Object.keys(desiredKeys).map((key) => (
                  <tr key={transaction.hash} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">{`${desiredKeys[key]}:`}</td>
                    <td className="p-3">{cleanShowRow(key)}</td>
                  </tr>
                )) : 'Loading transaction...'
              }
            </tbody>
          </table>
        </Box>
      </Container>
    </>
  )
}
