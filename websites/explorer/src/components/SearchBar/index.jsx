import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import Web3Utils from 'web3-utils'

import classNames from '../../utils/classNames'

function SearchBar({
  className, shadow, size, textSize,
}) {
  const location = useLocation()
  const history = useHistory()
  const [searchInput, setSearchInput] = useState('')
  const [isMarketplace, setIsMarketplace] = useState(false)
  useEffect(() => {
    const { pathname: path } = location
    setIsMarketplace(path.startsWith('/marketplace'))
  }, [location.pathname])
  const onSearchHandler = () => {
    if (!searchInput) return

    // Check if it's block number (digits only)
    if (/^\d+$/.test(searchInput)) {
      history.push(`/block/${searchInput}`)
      return
    }

    // NOTE: Hash lengths (excl. `0x`, which is + 2)
    // Transaction: 64 (+2)
    // Address: 40 (+2)
    if (Web3Utils.isAddress(searchInput)) {
      const address = searchInput.startsWith('0x') ? searchInput : `0x${searchInput}` // prepend 0x
      history.push(`/address/${address}`)
      return
    }

    if (searchInput.length === 66) {
      history.push(`/tx/${searchInput}`)
    }
  }

  // eslint-disable-next-line no-nested-ternary
  const sizeClass = size === 'lg' ? 'max-w-xl sm:max-w-2xl' : size === 'md' ? 'max-w-md sm:max-w-xl' : 'max-w-full'
  const textClass = `text-${textSize}`

  return (
    // <div className="relative w-full">
    //   <input className="w-full rounded-md py-2 px-4 sm:px-6 outline-none focus:outline-none" type="text" placeholder="Search..." />
    //   <button type="button" className="absolute top-0 bottom-0 right-0 bg-altgeld hover:bg-illini-orange rounded-tr-md rounded-br-md">
    //     <span className="w-auto flex justify-end items-center text-grey px-2 sm:px-3 hover:text-grey-darkest">
    //       <SearchIcon className="h-5 text-white" />
    //     </span>
    //   </button>
    // </div>
    <div className={classNames('flex items-center bg-white border-2 border-light-contrast rounded-lg h-full',
      isMarketplace && 'shadow-lg shadow-blue-100',
      shadow && 'shadow-cmd', sizeClass, textClass, className)}
    >
      <FontAwesomeIcon className="mx-3" icon={faSearch} />
      <input
        type="text"
        placeholder={isMarketplace ? 'Name/ TokenID/ SaleID' : 'Block/Transaction/Address'}
        className={clsx('flex-grow py-3 px-2 outline-none h-full w-auto max-w-full')}
        onInput={(e) => setSearchInput(e.target.value)}
      />
      {isMarketplace ? null : (
        <button
          type="button"
          className="py-3 px-4 text-white bg-altgeld rounded-tr-lg rounded-br-lg hover:bg-illini-orange cursor-pointer h-full"
          style={{ display: 'grid', placeContent: 'center' }}
          onClick={onSearchHandler}
        >
          Search
        </button>
      )}
    </div>
  )
}

SearchBar.propTypes = {
  className: PropTypes.string,
  shadow: PropTypes.bool,
  size: PropTypes.oneOf(['fluid', 'sm', 'md', 'lg']),
  textSize: PropTypes.oneOf(['sm', 'md', 'lg']),
}

SearchBar.defaultProps = {
  className: '',
  shadow: false,
  size: 'fluid',
  textSize: 'md',
}

export default SearchBar
