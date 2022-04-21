const { utils } = require('ethers')

const { DEBUG } = require('./constants')

const { isAddress, getAddress } = utils

function debug(...args) {
  if (DEBUG) console.log(...args)
}

function sendTx(signer, txparams) {
  return signer.sendTransaction(txparams, (error, transactionHash) => {
    if (error) {
      debug(`Error: ${error}`)
    }
    debug(`transactionHash: ${transactionHash}`)
    // checkForReceipt(2, params, transactionHash, resolve)
  })
}

async function normalizeAddress(ethers, address) {
  if (isAddress(address)) return getAddress(address)
  const accounts = await ethers.provider.listAccounts()
  if (accounts[address] !== undefined) return accounts[address]
  throw new Error(`Could not normalize address: ${address}`)
}

module.exports = {
  debug, normalizeAddress, sendTx,
}
