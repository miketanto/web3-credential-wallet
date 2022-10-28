import httpStatus from 'http-status'
import { BigNumber, ethers, utils } from 'ethers'

import Joi from 'joi'
import { envVars } from '../config'
import { provider } from '../constants'
import { GiesCoin, MerchCoin } from '../contracts'
import { Collections, Wallets } from '../models'
import { getAddressOfWallet, ApiError } from '../utils'
import { addressFilter } from '../validations/helper'
import { erc1155nftaddress, erc1155nftmarketaddress } from '../contracts/config'

const deployer = new ethers.Wallet(envVars.replenish.privateKey, provider)
const node1 = '0x3a6d5ab328deb57cfc42d76472e4cdab80003d7391625fa18a66c80425d92ddb'
const key1 = new ethers.Wallet(node1, provider)

function createNewWallet() {
  return ethers.Wallet.createRandom()
}

/**
 * @param {address} creatorAddress
 * @param {string} name
 * @param {string} description
 * @return {Promise<T>}
 */
async function createNewCollection(creatorAddress, name, description) {
  const collectionId = await Collections.create({
    name,
    creator: creatorAddress,
    contract_address: erc1155nftaddress,
    description,
    no_items: 0,
    no_owners: 1,
    floor_price: 0,
    volume_traded: 0,
    website: null,
    discord: null,
    instagram: null,
    twitter: null,
  }).then((result) => result.collection_id)
    .catch((err) => { throw err })
  return collectionId
}

// eslint-disable-next-line import/prefer-default-export
export async function address(options) {
  try {
    const { user: { email, first_name: firstName, last_name: lastName } } = options

    const queryParams = {
      where: { email },
      attributes: ['main_address', 'seed_phrase'],
      raw: true,
    }

    const walletRecords = await Wallets.findAll(queryParams)
    const noWalletExists = !walletRecords || walletRecords.length === 0

    let addresses
    let collectionId
    if (noWalletExists) {
      // NO WALLET EXISTS

      // Create New Walle

      // Store New Wallet Data (wallet.address is address 0 - `m/44'/60'/0'/0/0`)
      const wallet = createNewWallet()
      addresses = getAddressOfWallet(wallet, 0, 2)
      const createParams = { email, main_address: wallet.address, seed_phrase: wallet.mnemonic.phrase }

      await Wallets.create(createParams)

      // Create New Collection for user
      /* collectionId = createNewCollection(
        addresses[1], // use NFT address (index 1)
        `Collection by ${firstName} ${lastName}`,
        `Collection by ${firstName} ${lastName}`,
      ) */
    } else {
      // WALLET EXISTS
      // console.log("Wallet exists")
      const walletData = walletRecords[0]
      // If this is admin@illinois.edu->Return the mnemonic in here
      if (email === 'admin@illinois.edu') {
        const wallet = utils.HDNode.fromMnemonic(envVars.adminMnemonic)
        addresses = getAddressOfWallet(wallet, 0, 2)
      } else {
        const wallet = utils.HDNode.fromMnemonic(walletData.seed_phrase)
        addresses = getAddressOfWallet(wallet, 0, 2)
      }
      // Get Associated Collection Id
      /* const collectionRecord = await Collections.findOne({
        where: { creator: addresses[1] },
        raw: true,
      })

      if (!collectionRecord || !collectionRecord.collection_id) {
        // Create New Collection for existing user that doesn't have collection for some reason
        collectionId = createNewCollection(
          addresses[1], // use NFT address (index 1)
          `Collection by ${firstName} ${lastName}`,
          `Collection by ${firstName} ${lastName}`,
        )
      } else {
        // retrieve that existing collection id for the user
        collectionId = collectionRecord.collection_id
      } */
    }

    const [skillsWalletAddr, nftMarketAddr] = addresses

    // TODO: uncomment if to mint/transfer only for new accounts
    if (noWalletExists) {
    // Gies & Merch Coin
      console.log('No wallet')
      /* const signedGiesCoin = GiesCoin.connect(deployer)
      const signedMerchCoin = MerchCoin.connect(deployer)

      const defaultBalance = ethers.utils.parseUnits('100', 'ether')

      const tx1 = await signedGiesCoin.mintFor(nftMarketAddr, defaultBalance)
      const tx2 = await signedMerchCoin.mintFor(nftMarketAddr, defaultBalance)
      console.log(tx1)
      console.log(tx2) */
      const tx3 = await deployer.sendTransaction({ // I don't know if deployer itself has any balance
        to: nftMarketAddr,
        // Convert currency unit from ether to wei
        value: ethers.utils.parseEther('1000.0'),
      // value: ethers.utils.parseEther('10'),
      })
      const tx4 = await deployer.sendTransaction({ // I don't know if deployer itself has any balance
        to: skillsWalletAddr,
        // Convert currency unit from ether to wei
        value: ethers.utils.parseEther('1000.0'),
      // value: ethers.utils.parseEther('10'),
      })
    // const tx4 = await key1.sendTransaction({ //same as above except trying given
    //   to: nftMarketAddr,
    //   // Convert currency unit from ether to wei
    //   value: ethers.utils.parseEther('1000.0'),
    //   //value: ethers.utils.parseEther('10'),
    // })
    }

    return { skillsWallet: skillsWalletAddr, nftMarket: nftMarketAddr, nftCollectionId: collectionId }
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

export async function balance(options) {
  try {
    const { user: { wallet } } = options

    // Get idx = 1 for `nft marketplace` address associated with the user
    const addr = getAddressOfWallet(wallet, 1, 1)[0]
    // console.log("NFT Marketplace address:", addr)
    const providerGiesCoin = GiesCoin.connect(provider)
    const providerMerchCoin = MerchCoin.connect(provider)

    // Faucet code
    // console.log("Address of Node 1:", key1.address)
    const ceth = provider.getBalance(addr)
    ceth.then((balance) => {
      console.log('Wallet ETH: ', balance) // Checked, accounts created have no initial eth\
      if (balance == 0) {
        console.log('Wallet empty')
        // const tx0 = async () => {
        //   const tran = await key1.sendTransaction({
        //     to: addr,
        //     // Convert currency unit from ether to wei
        //     value: ethers.utils.parseEther('1.0'),
        //   }).then((txObj)=>console.log('txHash', txObj.hash))
        // }
        // tx0()
        // console.log(tx0)
        // One time transfer to erc1155nftmarketaddress account
      }
      // else{
      //   const userWallet = new ethers.Wallet(addr, provider)
      //   const ceth2 = provider.getBalance(erc1155nftmarketaddress) //Confirmed no balance
      //   ceth2.then((balance)=>{
      //     console.log("Market address ETH: ", balance)
      //       const tx0 = async () => {
      //         const tran = await userWallet.sendTransaction({
      //           to: erc1155nftmarketaddress,
      //           // Convert currency unit from ether to wei
      //           value: ethers.utils.parseEther('0.1'),
      //         }).then((txObj)=>console.log('txHash', txObj.hash))
      //       }
      //       tx0()
      //       console.log(tx0)
      //   })
      // }
    })
    const ceth1 = key1.getBalance()
    ceth1.then((balance) => {
      console.log('Node 1 Wallet ETH: ', balance) // Confirmed has ETH
    })

    // End of faucet code
    return {
      ETH: (await provider.getBalance(addr)).toString(),
      GCO: (await providerGiesCoin.balanceOf(addr)).toString(),
      MCO: (await providerMerchCoin.balanceOf(addr)).toString(),
    }
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}

// eslint-disable-next-line import/prefer-default-export
export async function search(options) {
  try {
    const { email } = options

    const queryParams = {
      where: { email },
      attributes: ['main_address', 'seed_phrase'],
      raw: true,
    }

    const walletRecords = await Wallets.findAll(queryParams)

    // Instead of throwing error on `no user found`,
    // return 200 (success) with wallet as empty object

    // if (!walletRecords || walletRecords.length === 0) {
    //   throw new ApiError(404, 'User not found')
    // }
    let addresses = [null, null]

    if (walletRecords && walletRecords.length > 0) {
      // wallet exists
      const walletData = walletRecords[0]
      const wallet = utils.HDNode.fromMnemonic(walletData.seed_phrase)
      addresses = getAddressOfWallet(wallet, 0, 2)
    }

    return {
      skillsWallet: addresses[0],
      nftMarket: addresses[1],
    }
  } catch (e) {
    console.log(e)
    if (e instanceof ApiError) throw e
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error')
  }
}
