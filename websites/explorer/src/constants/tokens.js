import * as address from './addresses'
import { SupportedChainId } from './chains'
import { Ether, Token } from '../entities'

import GiesCoinJSON from '../abis/GiesCoin.json'
import SampleTokenJSON from '../abis/SampleToken.json'
import { GiesCoin } from '../contracts'

const { abi: GiesCoinABI } = GiesCoinJSON
const { abi: SampleTokenABI } = SampleTokenJSON

export const ALMA = new Token(
  SupportedChainId.MAINNET,
  address.ALMA_ADDRESS,
  2, // decimals
  'ALMA',
  'Alma Coin',
)

export const UNI = new Token(
  SupportedChainId.MAINNET,
  address.UNI_ADDRESS,
  2,
  'UNI',
  'Union Coin',
)

export const QUAD = new Token(
  SupportedChainId.MAINNET,
  address.QUAD_ADDRESS,
  2,
  'QUAD',
  'Quad Coin',
)

// export const GCO = new Token(
//   SupportedChainId.MAINNET,
//   address.GCO_ADDRESS,
//   18,
//   'GCO',
//   'Gies Coin',
// )

// console.log(SampleTokenABI)
// console.log(GiesCoinABI)
export const allTokens = [
  ALMA, UNI, QUAD, // GCO,
]

export const tokenABIS = {
  ALMA: SampleTokenABI,
  UNI: SampleTokenABI,
  QUAD: SampleTokenABI,
  GCO: GiesCoinABI,
}
// TODO: Change the native token
export const NATIVE_TOKEN = ALMA
