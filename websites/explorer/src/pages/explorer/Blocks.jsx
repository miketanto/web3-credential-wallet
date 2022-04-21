import { utils as ethUtils } from 'ethers'
import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
// import ReactPaginate from 'react-paginate'

import Box from '../../components/Box'
import Container from '../../components/Container'
import formatDistanceToNowStrict from '../../utils/formatDistanceToNowStrict'
import getFromCoreAPI from '../../utils/getFromCoreAPI'

export default function Home() {
  const [blocks, setBlocks] = useState([])
  const [blockPage, setBlockPage] = useState(1)
  const [blocksPerPage, setBlocksPerPage] = useState(20)
  const [lastBlockNumber, setLastBlockNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(10)

  useEffect(() => {
    const config = { params: { last: true } }
    getFromCoreAPI('/block/list', config).then(({ payload }) => setLastBlockNumber(payload.blocks[0].number))
  }, []) // runs only once at start (to get last block initially)

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
    getFromCoreAPI('/block/list', config).then(({ payload }) => setBlocks(payload.blocks))
  }, [blockPage, blocksPerPage]) // run every time blockPage changes

  const handlePaginationClick = (event) => setBlockPage(Math.max(1, event.selected))

  return (
    <>
      <Helmet>
        <title>Blocks - iBlock Explorer</title>
      </Helmet>
      <Container>
        <Box className="flex-1" shadow>
          <div className="flex items-center py-4 px-6 border-b border-gray-100">
            <div className="grow text-lg text-illini-blue font-semibold">Latest Blocks</div>
          </div>

          <table className="w-full table-auto">
            <thead className="text-alma-300 text-left bg-cloud border-b border-gray-100 uppercase">
              <tr>
                <th className="p-2 pl-6">Block</th>
                <th className="p-2">Age</th>
                <th className="p-2">Tx #</th>
                <th className="p-2">Miner</th>
                <th className="p-2">Gas Used</th>
                <th className="p-2">Limit</th>
                <th className="p-2 pr-6">Base</th>
                {
                    // <th>Reward</th>
                    // <th>Burnt Fees</th>
                  }
              </tr>
            </thead>
            <tbody>
              {
                blocks ? blocks.map((block) => (
                  <tr key={block.hash} className="border-b border-gray-200 last:border-0">
                    <td className="py-3 px-2 pl-6">
                      <Link to={`/explorer/block/${block.number}`} className="text-industrial-300 hover:text-industrial">{block.number}</Link>
                    </td>
                    <td className="py-3 px-2">
                      {formatDistanceToNowStrict(new Date(block.timestamp), { includeSeconds: true })}
                    </td>
                    <td className="py-3 px-2">
                      {block.transactions.length}
                    </td>
                    <td className="py-3 px-2">
                      <Link to={`/explorer/miner/${block.miner}`} className="text-industrial-300 hover:text-industrial">{`${block.miner.substr(0, 14)}...`}</Link>
                    </td>
                    <td className="py-3 px-2">
                      {`${ethUtils.formatEther(block.gasUsed)} ETH`}
                    </td>
                    <td className="py-3 px-2">
                      0
                    </td>
                    <td className="py-3 px-2 pr-6">
                      0
                    </td>
                  </tr>
                )) : <tr>Loading blocks...</tr>
              }
            </tbody>
          </table>

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
        </Box>
      </Container>
      {
        /*
        <button
          type="button"
          onClick={() => {
            // toast('Hello World', {
            //   duration: 4000,
            //   position: 'top-center',
            //   className: 'bg-black',
            //   icon: '👏',
            // })
            toast.custom((t) => (
              // <div
              //   className={`bg-white px-6 py-4 shadow-md rounded-full ${
              //     t.visible ? 'animate-enter' : 'animate-leave'
              //   }`}
              // >
              //   Hello TailwindCSS! 👋
              // </div>
              <Transition
                show
                enter="transition-opacity duration-75"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                I will fade in and out
              </Transition>
            ))
          }}
        >
          Toast
        </button>
        */
      }
    </>
  )
}
