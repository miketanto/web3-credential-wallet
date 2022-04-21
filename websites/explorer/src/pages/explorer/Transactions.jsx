import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
// import ReactPaginate from 'react-paginate'

import Box from '../../components/Box'
import Container from '../../components/Container'
import getFromCoreAPI from '../../utils/getFromCoreAPI'

export default function Home() {
  const [transactions, setTransactions] = useState([])
  const [blockPage, setBlockPage] = useState(1)
  const [blocksPerPage, setBlocksPerPage] = useState(20)
  const [lastBlockNumber, setLastBlockNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(10)

  useEffect(() => {
    setTotalPages(Math.ceil(lastBlockNumber / blocksPerPage))
  }, [lastBlockNumber, blocksPerPage]) // runs when these dependent variables change

  useEffect(() => {
    const config = {
      params: {
        per_page: blocksPerPage,
        page: blockPage,
      },
    }
    getFromCoreAPI('/tx/list', config).then(({ payload }) => {
      const nonEmpty = payload.transactions.filter((tx) => tx.hash)
      setTransactions(nonEmpty)
    })
  }, [blockPage, blocksPerPage]) // side effect of changing blockPage or blocksPerPage

  return (
    <>
      <Helmet>
        <title>Transactions - iBlock Explorer</title>
      </Helmet>
      <Container>
        <Box className="flex-1" shadow>
          <div className="flex items-center py-4 px-6 border-b border-gray-100">
            <div className="grow text-lg text-illini-blue font-semibold">Latest Transactions</div>
          </div>

          <table className="w-full table-auto">
            <thead className="text-alma-300 text-left bg-cloud border-b border-gray-100 uppercase">
              <tr>
                <th className="p-2 pl-6">Transaction</th>
                <th className="p-2">Block</th>
                <th className="p-2">From</th>
                <th className="p-2">To</th>
                <th className="p-2">Gas</th>
                <th className="p-2">Gas Price</th>
              </tr>
            </thead>
            <tbody>
              {
                transactions ? transactions.map((tx, idx) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <tr key={`${idx}_${tx.hash}`} className="border-b border-gray-200 last:border-0">
                    <td className="py-3 px-2 pl-6">
                      <Link to={`/explorer/tx/${tx.hash}`} className="text-industrial-300 hover:text-industrial">{`${tx.hash.substr(0, 20)}...`}</Link>
                    </td>
                    <td className="py-3 px-2">
                      <Link to={`/explorer/block/${tx.block}`} className="text-industrial-300 hover:text-industrial">{tx.block}</Link>
                    </td>
                    <td className="py-3 px-2">
                      <Link to={`/explorer/address/${tx.from}`} className="text-industrial-300 hover:text-industrial">{tx.from ? `${tx.from.substr(0, 20)}...` : ''}</Link>
                    </td>
                    <td className="py-3 px-2">
                      <Link to={`/explorer/address/${tx.to}`} className="text-industrial-300 hover:text-industrial">{tx.to ? `${tx.to.substr(0, 20)}...` : ''}</Link>
                    </td>
                    <td className="py-3 px-2">{`${tx.gasUsed} of ${tx.gas}`}</td>
                    <td className="py-3 px-2 pr-6">{tx.gasPrice}</td>
                  </tr>
                )) : 'Loading transactions...'
              }
            </tbody>
          </table>
        </Box>

        <div className="mt-2">
          {
            /*
            <ReactPaginate
              breakLabel="..."
              nextLabel="next >"
              onPageChange={handlePaginationClick}
              pageRangeDisplayed={5}
              pageCount={totalPages}
              previousLabel="< prev"
              renderOnZeroPageCount={null}
              className="text-center"
              pageClassName="inline mx-1 p-1 hover:text-industrial"
              breakClassName="inline hover:text-industrial"
              activeClassName="inline hover:text-industrial"
              previousClassName="inline hover:text-industrial"
              nextClassName="inline hover:text-industrial"
            />
            */
            }
        </div>
      </Container>
    </>
  )
}
