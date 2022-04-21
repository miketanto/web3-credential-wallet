import clsx from 'clsx'
import { utils as ethUtils } from 'ethers'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import useSWR from 'swr'

import UIUCBackgroundImage from '../../assets/background/uiuc-1.jpg'
import Box from '../../components/Box'
import Container from '../../components/Container'
import Pill from '../../components/Pill'
import SearchBar from '../../components/SearchBar'
import commas from '../../utils/commas'
import formatDistanceToNowStrict from '../../utils/formatDistanceToNowStrict'
import getFromCoreAPI from '../../utils/getFromCoreAPI'

const { formatEther, formatUnits } = ethUtils

const classes = {
  summary: {
    box: 'flex-1 py-4 overflow-hidden',
    inner: 'h-full px-4 sm:px-6',
  },
}

/* eslint-disable react/prop-types */
const Table = ({ children }) => (<table className="w-full">{children}</table>)

const TableHead = ({ children }) => (
  <thead className="text-alma-300 text-left bg-cloud border-b border-gray-100 uppercase">
    {children}
  </thead>
)

const TableBody = ({ children }) => (<tbody>{children}</tbody>)

const TableRow = ({ children }) => (<tr className="border-b border-gray-100 last:border-0">{children}</tr>)
/* eslint-enable react/prop-types */

const TableCell = ({
  children, className, text, th,
}) => {
  // Use `children` if provided; Use `text` otherwise
  const sidePadClass = 'first:pl-6 last:pr-6'
  if (th) return <th className={clsx('p-2', sidePadClass, className)}>{children ?? text}</th>
  return <td className={clsx('py-3 px-2', sidePadClass, className)}>{children ?? text}</td>
}

TableCell.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  th: PropTypes.bool,
}

TableCell.defaultProps = {
  children: null,
  className: '',
  text: '',
  th: false,
}

export default function Overview() {
  const [blocks, setBlocks] = useState([])
  const [lastBlockNumber, setLastBlockNumber] = useState(0)
  // const [avgBlockTime, setAvgBlockTime] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [last24hr, setLast24hrStat] = useState({
    /**
     * * Format everything as string (remove decimals)
     *   since formatEther/formatUnits only accept integer string
     */
    tx: { count: '0', avgValue: '0' },
    gasUsed: { avg: '0', min: '0', max: '0' },
  })

  const { data: txCount, error } = useSWR(
    `${process.env.REACT_APP_API_URL}/tx/count-all`,
    (url) => fetch(url).then((res) => res.json()).then((data) => data.payload.count),
    {
      refreshInterval: 5000, // poll every 5s
    },
  )

  useEffect(() => {
    const config = { params: { per_page: 10 } }
    getFromCoreAPI('/block/list', config).then(({ payload }) => {
      setLastBlockNumber(payload.blocks[0].number)
      // Format blocks to fit the Data Table
      const blocks = payload.blocks.map((block) => ({
        ...block,
        // human-readable text
        _age: formatDistanceToNowStrict(new Date(block.timestamp), { includeSeconds: true }),
        _gasUsed: formatEther((block.gasUsed)), // removed `MCO`
        _miner: `${block.miner.substr(0, 7)}..`,
        _txCount: block.transactions.length,
      }))
      setBlocks(blocks)
    })
  }, []) // runs only once

  // useEffect(() => {
  //   getFromCoreAPI('/block/average-time').then(({ payload }) => setAvgBlockTime(payload.averageBlockTime))
  // }, []) // [] makes it run only once

  useEffect(() => {
    getFromCoreAPI('/tx/list', { params: { per_page: 15 } }).then(({ payload }) => {
      // TODO: for some reason, same txs are included multiple times
      const nonEmpty = payload.transactions.filter((tx) => tx.hash && tx.from && tx.to)
      nonEmpty.filter((v, i, a) => (a.findIndex((t) => (t.hash === v.hash)) === i))
      // Format txs (last 10) to fit the Data Table
      // We fetch 15 just to make sure there are more than enough non-empty (non-error) txs to show
      const maxTxs = nonEmpty.slice(0, 10).map((tx) => ({
        ...tx,
        // human-readable text
        _hash: `${tx.hash.substring(0, 8)}..`,
        _from: `${tx.from.substring(0, 8)}..`,
        _to: `${tx.to.substring(0, 8)}..`,
      }))
      setTransactions(maxTxs)
    })
  }, []) // [] makes it run only once

  useEffect(() => {
    getFromCoreAPI('/tx/last24hr').then(({ payload }) => {
      setLast24hrStat((prevState) => ({
        ...prevState,
        tx: {
          count: parseInt(payload.txCount).toString(),
          // For avg tx value, trim off any decimal since it throws BN error
          // toLocaleString with this params avoids scientific notation (e.g. 1.23e+23)
          avgValue: parseInt(payload.valueAvg).toLocaleString('fullwide', { useGrouping: false }),
        },
        gasUsed: {
          avg: formatUnits(Number(payload.gasUsedAvg || 0).toFixed(0), 0), // wei, 10^18
          min: formatUnits(Number(payload.gasUsedMIN || 0).toFixed(0), 0),
          max: formatUnits(Number(payload.gasUsedMAX || 0).toFixed(0), 0),
        },
      }))
    })
  }, [])

  return (
    <>
      <section className="relative w-full pt-24 md:pt-32 pb-10 overflow-hidden z-20">
        <div
          className="absolute h-full w-full inset-0 bg-cover bg-center z-10"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(160,160,160,0.7) 0%, rgba(200,200,200,0.3) 50%, rgba(220,220,220,0.2) 70%, rgba(255,255,255,0.2) 100%), url(${UIUCBackgroundImage})` }}
        />
        <div className="relative max-w-6xl xl:max-w-8xl m-auto pb-4 px-4 text-sm sm:text-md z-30">
          <h2 className="text-3xl text-white font-extrabold">iBlock Blockchain Explorer</h2>
          <div className="max-w-md mt-6">
            <SearchBar />
          </div>
        </div>
        <div className="h-20 md:h-28" />
      </section>

      <Container className="relative grid grid-cols-2 gap-8 -mt-20 md:-mt-28 px-4 text-sm sm:text-md ">
        <div className="col-span-2">
          <Box flexRow shadow size="minimal">
            <div className={clsx(classes.summary.box, 'rounded-tl-md rounded-bl-md')}>
              <div className={clsx(classes.summary.inner, 'border-r border-gray-200')}>
                <div className="flex flex-col items-stretch">
                  <div className="flex flex-1 py-3 text-md border-b border-gray-100 last:border-0">
                    <span className="sr-only">Last Block Number</span>
                    <div className="flex-grow">Last Block</div>
                    <div className="text-bold">
                      <Link to={`/explorer/block/${lastBlockNumber}`} className="text-industrial hover:text-industrial-300">{lastBlockNumber}</Link>
                    </div>
                  </div>

                  <div className="flex flex-1 py-3 text-md border-b border-gray-100 last:border-0">
                    <span className="sr-only">Total Transactions</span>
                    <div className="flex-grow">Total Transaction</div>
                    <div className="text-bold">{txCount}</div>
                  </div>

                  <div className="flex flex-1 py-3 text-md border-b border-gray-100 last:border-0">
                    <span className="sr-only">Average Block Time</span>
                    <div className="flex-grow">Avg. Block Time</div>
                    <div className="text-bold">15s</div>
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.summary.box}>
              <div className={clsx(classes.summary.inner, 'border-r border-gray-200')}>
                <div className="flex py-2">
                  <div className="flex-grow">
                    <div className="text-bold text-lg">Transactions</div>
                    <div className="text-gray-500 text-xs">Last 24 hours</div>
                  </div>
                  <div className="flex-initial mr-2">
                    <div className="text-altgeld text-lg">{commas(last24hr.tx.count)}</div>
                  </div>
                </div>

                <div className="flex py-2">
                  <div className="flex-grow">
                    <div className="text-bold text-lg">Avg Tx Value</div>
                    <div className="text-gray-500 text-xs">Last 24 hours</div>
                  </div>
                  <div className="flex-initial mr-2">
                    <div className="text-altgeld text-lg overflow-x-scroll" style={{ maxWidth: '200px' }}>
                      <span>{formatEther(last24hr.tx.avgValue).substring(0, 8)}</span>
                      <span>&nbsp;ETH</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={clsx(classes.summary.box, 'rounded-tr-md rounded-br-md')}>
              <div className={classes.summary.inner}>
                <div className="h-auto">
                  <div className="flex py-2">
                    <div className="flex-grow">
                      <div className="text-bold text-lg">Gas Average</div>
                      <div className="text-gray-500 text-xs">Last 24 hours</div>
                    </div>
                    <div className="flex-initial mr-2">
                      <div className="text-altgeld text-lg">{`${commas(last24hr.gasUsed.avg)} wei`}</div>
                    </div>
                  </div>

                  <div className="flex py-2">
                    <div className="flex-grow">
                      <div className="text-bold text-lg">Gas Max</div>
                      <div className="text-gray-500 text-xs">Last 24 hours</div>
                    </div>
                    <div className="flex-initial mr-2">
                      <div className="text-altgeld text-lg">{`${commas(last24hr.gasUsed.max)} wei`}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Box>
        </div>

        <Box noFlex shadow size="minimal">
          <div className="flex items-center py-4 px-6 border-b border-gray-100">
            <div className="grow text-lg text-illini-blue font-semibold">Latest Blocks</div>
            <div className="flex-initial">
              <Link to="/explorer/blocks">
                <Pill
                  background="cloud"
                  color="industrial"
                  className="py-1 px-4"
                  clickable
                  hoverBackground="cloud-100"
                  rounded="sm"
                  text="View All Blocks"
                />
              </Link>
            </div>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell th text="Block" />
                <TableCell th text="Age" />
                <TableCell th text="Miner" />
                <TableCell th text="Tx #" />
                <TableCell th text="Gas Used" />
              </TableRow>
            </TableHead>
            <TableBody>
              {blocks.map((block) => (
                <TableRow key={block.number}>
                  <TableCell>
                    <Link to={`/explorer/block/${block.number}`} className="text-industrial-300 hover:text-industrial font-semibold text-cursor">{block.number}</Link>
                  </TableCell>
                  <TableCell text={block._age} />
                  <TableCell>
                    <Link to={`/explorer/miner/${block.miner}`} className="text-industrial-300 hover:text-industrial">{block._miner}</Link>
                  </TableCell>
                  <TableCell text={block._txCount} />
                  <TableCell text={block.gasUsed} />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Box noFlex shadow size="minimal">
          <div className="flex items-center py-4 px-6 border-b border-gray-100">
            <div className="grow text-lg text-illini-blue font-semibold">Latest Transactions</div>
            <div className="flex-initial">
              <Link to="/explorer/txs">
                <Pill
                  background="cloud"
                  color="industrial"
                  className="py-1 px-4"
                  clickable
                  hoverBackground="cloud-100"
                  rounded="sm"
                  text="View All Txs"
                />
              </Link>
            </div>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell th text="Hash" />
                <TableCell th text="Block" />
                <TableCell th text="From" />
                <TableCell th text="To" />
                <TableCell th text="Gas Price" />
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx, idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <TableRow key={`${idx}_${tx.hash}`}>
                  <TableCell>
                    <Link to={`/explorer/tx/${tx.hash}`} className="text-industrial-300 hover:text-industrial font-semibold text-cursor">{tx._hash}</Link>
                  </TableCell>
                  <TableCell text={tx.block} />
                  <TableCell>
                    <Link to={`/explorer/address/${tx.from}`} className="text-industrial-300 hover:text-industrial">{tx._from}</Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/explorer/address/${tx.to}`} className="text-industrial-300 hover:text-industrial">{tx._to}</Link>
                  </TableCell>
                  <TableCell text={tx.gasPrice} />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Container>
    </>
  )
}
