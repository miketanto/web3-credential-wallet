import clsx from 'clsx'
import { formatDistanceToNowStrict } from 'date-fns'
import { utils as ethUtils } from 'ethers'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Link, useParams } from 'react-router-dom'
import useSWR from 'swr'
import type { SWRConfiguration, SWRResponse } from 'swr'

import Box from '../../components/Box'
import Container from '../../components/Container'
import Pill from '../../components/Pill'

const { formatEther } = ethUtils

const Table = ({ children }: { children: JSX.Element | JSX.Element[] }) => (<table className="w-full">{children}</table>)

const TableBody = ({ children }: { children: JSX.Element | JSX.Element[] }) => (<tbody>{children}</tbody>)

const TableRow = ({ children }: { children: JSX.Element | JSX.Element[] }) => (
  <tr className="hover:bg-gray-50 border-b border-gray-100 last:border-0">{children}</tr>
)

type TabelCellProps = {
  children?: JSX.Element | JSX.Element[] | null,
  className?: string,
  text?: string | number,
}

const TableCell = ({ children, className, text } : TabelCellProps) => {
  // Use `children` if provided; Use `text` otherwise
  const sidePadClass = 'first:pl-6 last:pr-6 first:w-36 md:first:w-44'
  return <td className={clsx('py-3 pl-2', sidePadClass, className)}>{children ?? text}</td>
}

TableCell.defaultProps = {
  children: null,
  className: '',
  text: '',
}

interface Block {
  difficulty: number,
  extraData: string,
  gasLimit: string,
  gasUsed: string,
  hash: string,
  miner: string,
  _miner: string,
  nonce: string,
  number: number,
  parentHash: string,
  timestamp: number,
  transactions: any[],
  txCount: number,
}

const fetcher = (url: RequestInfo) => fetch(url).then((res) => res.json())
const pollConfig: SWRConfiguration = {
  refreshInterval: 5000, // poll every 5s
}

type BlockHeightPayload = {
  payload: {
    height: number,
  },
}

export default function Home() {
  const { blockNumber: _blockNumber } = useParams<any>()

  const blockNumber = parseInt(_blockNumber)

  const { data: blockHeightData, error: blockHeightError }: SWRResponse<BlockHeightPayload, Error> = useSWR<BlockHeightPayload>(
    `${process.env.REACT_APP_API_URL}/block/height`,
    fetcher,
    pollConfig,
  )
  // if error or undefined, use blockNumber defined in query
  const maxBlockHeight = blockHeightError || !blockHeightData ? blockNumber : blockHeightData.payload.height

  const { data: block, error: blockError }: SWRResponse<Block, Error> = useSWR<Block>(
    blockNumber ? `${process.env.REACT_APP_API_URL}/block/get?key=${blockNumber}` : null,
    (url: RequestInfo) => fetch(url)
      .then((res) => res.json())
      .then((res) => res?.payload)
      .then((data) => ({
        ...data.block,
        // human-readable text
        _miner: `${data.block.miner.substring(0, 7)}..`,
        gasLimit: formatEther(data.block.gasLimit || 0),
        gasUsed: formatEther(data.block.gasUsed || 0),
        txCount: data.block.transactions.length,
      })),
  )

  return (
    <>
      <Helmet>
        <title>{`Block #${blockNumber} - iBlock Explorer`}</title>
      </Helmet>
      <Container>
        <Box className="flex-1" shadow size="minimal">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 py-3 px-6 border-b border-gray-100">
            <div className="text-lg font-bold text-illini-blue">
              {`Block #${blockNumber}`}
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              {
                // Show button to next block only if block is not the first
                blockNumber - 1 >= 1 && (
                <Link to={`/explorer/block/${blockNumber - 1}`}>
                  <Pill
                    background="cloud"
                    color="industrial"
                    className="py-1 px-4"
                    clickable
                    hoverBackground="cloud-100"
                    rounded="sm"
                    text="< Previous Block"
                  />
                </Link>
                )
              }
              {
                // Show button to next block only if block is not the last
                blockNumber + 1 <= maxBlockHeight && (
                  <Link to={`/explorer/block/${blockNumber + 1}`}>
                    <Pill
                      background="cloud"
                      color="industrial"
                      className="py-1 px-4"
                      clickable
                      hoverBackground="cloud-100"
                      rounded="sm"
                      text="Next Block >"
                    />
                  </Link>
                )
              }
            </div>
          </div>

          <Table>
            <TableBody>
              <TableRow>
                <TableCell text="Block Height:" />
                <TableCell text={block ? block.number : 'Loading...'} />
              </TableRow>
              <TableRow>
                <TableCell text="Nonce:" />
                <TableCell text={block ? block.nonce : 'Loading...'} />
              </TableRow>
              <TableRow>
                <TableCell text="Timestamp:" />
                <TableCell>
                  {
                    block ? (
                      <span>
                        {`${formatDistanceToNowStrict(new Date(block.timestamp))} ago (${new Date(block.timestamp).toISOString()})`}
                      </span>
                    ) : <span>Loading...</span>
                  }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell text="Miner:" />
                <TableCell>
                  {
                    block ? (
                      <Link to={`/explorer/miner/${block?.miner}`} className="text-industrial-300 hover:text-industrial">{block.miner}</Link>
                    ) : <span>Loading...</span>
                  }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell text="Difficulty:" />
                <TableCell text={block ? block.difficulty : 'Loading...'} />
              </TableRow>
              <TableRow>
                <TableCell text="Gas Used:" />
                <TableCell text={block ? block.gasUsed : 'Loading...'} />
              </TableRow>
              <TableRow>
                <TableCell text="Gas Limit:" />
                <TableCell text={block ? block.gasLimit : 'Loading...'} />
              </TableRow>
              <TableRow>
                <TableCell text="Transactions:" />
                <TableCell>
                  {
                    block ? block.transactions && block.transactions.length ? block.transactions.map((tx) => (
                      <div className="py-1" key={tx.hash}>
                        <Link to={`/explorer/tx/${tx.hash}`} className="text-industrial-300 hover:text-industrial visited:text-industrial-200">{tx.hash}</Link>
                      </div>
                    )) : <span>None</span> : <span>Loading...</span>
                  }
                </TableCell>
              </TableRow>
              {
                    // <TableRow>
                    //   <TableCell text="Uncles:" />
                    //   <TableCell>
                    //     {
                    //       block.uncles && typeof block.uncles === 'object' ? block.uncles.map((txHash) => (
                    //         <div className="py-1" key={txHash}>
                    //           <Link to={`/explorer/tx/${txHash}`} className="text-industrial-300 hover:text-industrial visited:text-industrial-200">{txHash}</Link>
                    //         </div>
                    //       )) : 'None'
                    //     }
                    //   </TableCell>
                    // </TableRow>
                    // <TableRow>
                    //   <TableCell text="Receipts Root" />
                    //   <TableCell text={block.receiptsRoot} />
                    // </TableRow>
                    // <TableRow>
                    //   <TableCell text="Extra Data" />
                    //   <TableCell text={block.extraData} />
                    // </TableRow>
                  }
            </TableBody>
          </Table>
        </Box>
      </Container>
    </>
  )
}
