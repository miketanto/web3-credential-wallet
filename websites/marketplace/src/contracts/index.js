/* eslint-disable @typescript-eslint/no-var-requires */
import { ethers } from 'ethers'
import {
  mcoaddress, gcoaddress, nftaddress, nftmarketaddress, erc1155nftmarketaddress, erc1155nftaddress,
} from '../configs/contracts/contract_config'
import { getVanillaContract } from '../utils/index'

/* eslint-disable global-require */
const Web3Provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_WEB3_URL)
export const MerchCoin = getVanillaContract(mcoaddress, require('./contracts/MerchCoin.json').abi, Web3Provider)
export const GiesCoin = getVanillaContract(gcoaddress, require('./contracts/GiesCoin.json').abi, Web3Provider)
export const NFT = getVanillaContract(nftaddress, require('./contracts/NFT.json').abi, Web3Provider)
export const NFTMarket = getVanillaContract(nftmarketaddress, require('./contracts/NFTMarket.json').abi, Web3Provider)
export const ERC1155Market = getVanillaContract(erc1155nftmarketaddress, require('./contracts/ERC1155Market.json').abi, Web3Provider)
export const ERC1155NFT = getVanillaContract(erc1155nftaddress, require('./contracts/ERC1155NFT.json').abi, Web3Provider)
