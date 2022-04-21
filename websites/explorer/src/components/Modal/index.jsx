/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import exit from '../../assets/icons/exit.svg'
import { sellNft } from '../../pages/marketplace/nftFunctions'

function Modal({ currModal, toggle, account }) {
  const [out, setOut] = useState(false)
  const [salePrice, setSalePrice] = useState()
  useEffect(() => {
    console.log(currModal)
  }, [])

  const closeModal = (event) => {
    setTimeout(() => {
      toggle(false)
    }, 300)
    setOut(true)
  }
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <motion.div
      className="bg-black/50 z-10 fixed top-0 left-0 w-screen h-screen"
      variants={{
        open: {
          opacity: 1,
        },
        collapsed: { opacity: 0 },
      }}
      animate={!out ? 'open' : 'collapsed'}
      initial="collapsed"
    >
      <motion.div
        className="fixed left-1/3 top-1/4 w-[33%] h-1/2 z-20 grid grid-rows-[10%_70%_20%] rounded-md bg-orange-400 shadow-md items-center justify_center"
        variants={{
          open: {
            x: 0, y: 0, opacity: 1,
          },
          collapsed: {
            x: 0, y: -100, opacity: 0,
          },
        }}
        animate={!out ? 'open' : 'collapsed'}
        initial="collapsed"
      >
        <img
          src={exit}
          alt="exit"
          className="left-3/4 top-2 h-4"
          onClick={() => { closeModal() }}
        />
        <div className=" grid grid-rows-[55%_45%] items-center justify-items-center w-[95%] justify-self-center h-full ">
          <div className="h-full flex items-center justify-center w-full justify-self-center">
            <img className="self-center h-full max-h-full max-w-full" src={currModal.image} alt="nftpic" />
          </div>
          <div className="h-full grid grid-rows-[30%_20%_50%] items-center justify-items-center text-center p-[1rem_0_0.5rem_1rem]">
            <div className="pb-[2vh] font-medium text-xl">
              { currModal.name }
              {' '}
              NFT
            </div>
            <h5>
              <span>{currModal.price}</span>
              {' '}
              GCO

            </h5>
            <input
              type="text"
              placeholder={`${currModal.price} GCO`}
              className="w-10/12  py-3 px-2 flex-grow outline-none rounded-md"
              onChange={(event) => { setSalePrice(event.target.value) }}
            />
          </div>
        </div>
        <motion.div
          className="justify-self-center w-1/2 text-center bg-white rounded-md p-[0.7rem_1.2rem_0.7rem_1.2rem] mr-4"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { sellNft(currModal, account, salePrice).then(() => closeModal()) }}
        >
          <h3>
            <span
              style={{
                fontFamily: 'Times New Roman',
                fontSize: '1.1rem',
              }}
            >
              +
            </span>
                            &nbsp; SELL
          </h3>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default Modal
