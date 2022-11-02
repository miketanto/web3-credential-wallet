import { ethers } from 'ethers'

import {
  mcoaddress, gcoaddress, nftaddress, nftmarketaddress,
  erc1155nftmarketaddress, erc1155nftaddress, skillswalletaddress, skillsclearanceaddress,
} from './config'
import { envVars } from '../config'
import mco from './contracts/MerchCoin.json'
import gco from './contracts/GiesCoin.json'
import nft from './contracts/NFT.json'
import nftmarket from './contracts/NFTMarket.json'
import erc1155nft from './contracts/ERC1155NFT.json'
import erc1155market from './contracts/ERC1155Market.json'
import skillswallet from './contracts/SkillsWallet.json'
import skillsclearance from './contracts/SkillsClearance.json'
import { getVanillaContract } from '../utils/contract'

/* eslint-disable global-require */
const Web3Provider = new ethers.providers.StaticJsonRpcProvider(envVars.web3NodeUrl)
export const MerchCoin = getVanillaContract(mcoaddress, mco.abi, Web3Provider)
export const GiesCoin = getVanillaContract(gcoaddress, gco.abi, Web3Provider)
export const NFT = getVanillaContract(nftaddress, nft.abi, Web3Provider)
export const NFTMarket = getVanillaContract(nftmarketaddress, nftmarket.abi, Web3Provider)
export const ERC1155Market = getVanillaContract(erc1155nftmarketaddress, erc1155market.abi, Web3Provider)
export const ERC1155NFT = getVanillaContract(erc1155nftaddress, erc1155nft.abi, Web3Provider)
export const SkillsWallet = getVanillaContract(skillswalletaddress, skillswallet.abi, Web3Provider)
export const SkillsClearance = getVanillaContract(skillsclearanceaddress, skillsclearance.abi, Web3Provider)
