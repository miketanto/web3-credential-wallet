require('dotenv').config()

require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-etherscan')
require('@nomiclabs/hardhat-waffle')
require('@tenderly/hardhat-tenderly')
require('hardhat-deploy')
require('hardhat-gas-reporter')

const chalk = require('chalk')
const { utils } = require('ethers')
const fs = require('fs')
// const { config, task } = require('hardhat')
const networks = require('./utils/networks')

const { TARGET_NETWORK } = require('./utils/constants')
const { debug, normalizeAddress, sendTx } = require('./utils/helpers')

const { formatUnits, parseUnits } = utils

module.exports = {
  defaultNetwork: TARGET_NETWORK,
  gasReporter: {
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP || null,
    // https://gasstation-mainnet.matic.network/v2
    // https://gasstation-mumbai.matic.today/v2
  },
  networks,
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.7',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  ovm: {
    solcVersion: '0.7.6',
  },
  namedAccounts: {
    deployer: {
      default: 0, // take the first account as deployer by default
    },
  },
  // etherscan: {
  //   apiKey: 'DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW',
  // },
}

task('wallet', 'Create a wallet (pk) link', async (_, { ethers }) => {
  const randomWallet = ethers.Wallet.createRandom()
  const privateKey = randomWallet._signingKey().privateKey
  console.log('🔐 WALLET Generated as ' + randomWallet.address + '')
  console.log('🔗 http://localhost:3000/pk#' + privateKey)
})

task('fundedwallet', 'Create a wallet (pk) link and fund it with deployer?')
  .addOptionalParam('amount', 'Amount of ETH to send to wallet after generating')
  .addOptionalParam('url', 'URL to add pk to')
  .setAction(async (taskArgs, { network, ethers }) => {
    const randomWallet = ethers.Wallet.createRandom()
    const privateKey = randomWallet._signingKey().privateKey
    console.log(`🔐 WALLET Generated as ${randomWallet.address}`)
    const url = taskArgs.url ? taskArgs.url : 'http://localhost:3000'

    let localDeployerMnemonic
    try {
      localDeployerMnemonic = fs.readFileSync('./mnemonic.txt')
      localDeployerMnemonic = localDeployerMnemonic.toString().trim()
    } catch (e) {
      /* do nothing - this file isn't always there */
    }

    const amount = taskArgs.amount ? taskArgs.amount : '0.01'
    const tx = {
      to: randomWallet.address,
      value: ethers.utils.parseEther(amount),
    }

    // SEND USING LOCAL DEPLOYER MNEMONIC IF THERE IS ONE
    // IF NOT SEND USING LOCAL HARDHAT NODE:
    if (localDeployerMnemonic) {
      let deployerWallet = new ethers.Wallet.fromMnemonic(
        localDeployerMnemonic,
      )
      deployerWallet = deployerWallet.connect(ethers.provider)
      console.log(`💵 Sending ${amount} ETH to ${randomWallet.address} using deployer account`)
      const res = await deployerWallet.sendTransaction(tx)
      console.log(`\n ${url} /pk#${privateKey} \n`)
    } else {
      console.log(`💵 Sending ${amount} ETH to ${randomWallet.address} using local node`)
      console.log(`\n ${url} /pk#${privateKey} \n`)
      return sendTx(ethers.provider.getSigner(), tx)
    }
  })

task(
  'generate',
  'Create a mnemonic for builder deploys',
  async (_, { ethers }) => {
    const bip39 = require('bip39')
    const hdkey = require('ethereumjs-wallet/hdkey')
    const mnemonic = bip39.generateMnemonic()
    debug('mnemonic', mnemonic)
    const seed = await bip39.mnemonicToSeed(mnemonic)
    debug('seed', seed)
    const hdWallet = hdkey.fromMasterSeed(seed)
    // eslint-disable-next-line quotes
    const walletHDPath = "m/44'/60'/0'/0/"
    const accountIndex = 0
    const fullPath = walletHDPath + accountIndex
    debug('fullPath', fullPath)
    const wallet = hdWallet.derivePath(fullPath).getWallet()
    const privateKey = '0x' + wallet._privKey.toString('hex')
    debug('privateKey', privateKey)
    const EthUtil = require('ethereumjs-util')
    const address = '0x' + EthUtil.privateToAddress(wallet._privKey).toString('hex')
    console.log(`🔐 Account Generated as ${address} and set as mnemonic in packages/hardhat`)
    console.log('💬 Use \'yarn run account\' to get more information about the deployment account.')

    fs.writeFileSync('./' + address + '.txt', mnemonic.toString())
    fs.writeFileSync('./mnemonic.txt', mnemonic.toString())
  },
)

task(
  'mineContractAddress',
  'Looks for a deployer account that will give leading zeros',
)
  .addParam('searchFor', 'String to search for')
  .setAction(async (taskArgs, { network, ethers }) => {
    let contractAddress = ''
    let address

    const bip39 = require('bip39')
    const hdkey = require('ethereumjs-wallet/hdkey')

    let mnemonic = ''
    while (contractAddress.indexOf(taskArgs.searchFor) !== 0) {
      mnemonic = bip39.generateMnemonic()
      debug('mnemonic', mnemonic)
      const seed = await bip39.mnemonicToSeed(mnemonic)
      debug('seed', seed)
      const hdwallet = hdkey.fromMasterSeed(seed)
      const walletHDPath = 'm/44\'/60\'/0\'/0/'
      const accountIndex = 0
      const fullPath = walletHDPath + accountIndex
      debug('fullPath', fullPath)
      const wallet = hdwallet.derivePath(fullPath).getWallet()
      const privateKey = '0x' + wallet._privKey.toString('hex')
      debug('privateKey', privateKey)
      const EthUtil = require('ethereumjs-util')
      address = '0x' + EthUtil.privateToAddress(wallet._privKey).toString('hex')

      const rlp = require('rlp')
      const keccak = require('keccak')

      const nonce = 0x00 // The nonce must be a hex literal!
      const sender = address

      const inputArr = [sender, nonce]
      const rlpEncoded = rlp.encode(inputArr)

      const contractAddressLong = keccak('keccak256').update(rlpEncoded).digest('hex')

      contractAddress = contractAddressLong.substring(24) // Trim the first 24 characters.
    }

    console.log(`⛏ Account Mined as ${address} and set as mnemonic in packages/hardhat`)
    console.log(`📜 This will create the first contract: ${chalk.magenta('0x' + contractAddress)}`)
    console.log('💬 Use \'yarn run account\' to get more information about the deployment account.')

    fs.writeFileSync(`./${address}_produces_contractAddress.txt`, mnemonic.toString())
    fs.writeFileSync('./mnemonic.txt', mnemonic.toString())
  })

task(
  'account',
  'Get balance informations for the deployment account.',
  async (_, { ethers }) => {
    const hdkey = require('ethereumjs-wallet/hdkey')
    const bip39 = require('bip39')
    try {
      const mnemonic = fs.readFileSync('./mnemonic.txt').toString().trim()
      debug('mnemonic', mnemonic)
      const seed = await bip39.mnemonicToSeed(mnemonic)
      debug('seed', seed)
      const hdwallet = hdkey.fromMasterSeed(seed)
      const walletHDPath = 'm/44\'/60\'/0\'/0/'
      const accountIndex = 0
      const fullPath = walletHDPath + accountIndex
      debug('fullPath', fullPath)
      const wallet = hdwallet.derivePath(fullPath).getWallet()
      const privateKey = '0x' + wallet._privKey.toString('hex')
      debug('privateKey', privateKey)
      const EthUtil = require('ethereumjs-util')
      const address = '0x' + EthUtil.privateToAddress(wallet._privKey).toString('hex')

      const qrcode = require('qrcode-terminal')
      qrcode.generate(address)
      console.log('‍📬 Deployer Account is ' + address)
      for (const n in config.networks) {
        // console.log(config.networks[n],n)
        try {
          const provider = new ethers.providers.JsonRpcProvider(
            config.networks[n].url,
          )
          const balance = await provider.getBalance(address)
          console.log(' -- ' + n + ' --  -- -- 📡 ')
          console.log('   balance: ' + ethers.utils.formatEther(balance))
          console.log(
            '   nonce: ' + (await provider.getTransactionCount(address)),
          )
        } catch (e) {
          debug(e)
        }
      }
    } catch (err) {
      console.log('--- Looks like there is no mnemonic file created yet.')
      console.log(`--- Please run ${chalk.greenBright('yarn generate')} to create one`)
    }
  },
)

task('accounts', 'Prints the list of accounts', async (_, { ethers }) => {
  const accounts = await ethers.provider.listAccounts()
  accounts.forEach((account) => console.log(account))
})

task('blockNumber', 'Prints the block number', async (_, { ethers }) => {
  const blockNumber = await ethers.provider.getBlockNumber()
  console.log(blockNumber)
})

task('balance', 'Prints an account\'s balance')
  .addPositionalParam('account', 'The account\'s address')
  .setAction(async (taskArgs, { ethers }) => {
    const balance = await ethers.provider.getBalance(
      await normalizeAddress(ethers, taskArgs.account),
    )
    console.log(formatUnits(balance, 'ether'), 'ETH')
  })

task('send', 'Send ETH')
  .addParam('from', 'From address or account index')
  .addOptionalParam('to', 'To address or account index')
  .addOptionalParam('amount', 'Amount to send in ether')
  .addOptionalParam('data', 'Data included in transaction')
  .addOptionalParam('gasPrice', 'Price you are willing to pay in gwei')
  .addOptionalParam('gasLimit', 'Limit of how much gas to spend')

  .setAction(async (taskArgs, { network, ethers }) => {
    const from = await normalizeAddress(ethers, taskArgs.from)
    debug(`Normalized from address: ${from}`)
    const fromSigner = await ethers.provider.getSigner(from)

    let to
    if (taskArgs.to) {
      to = await normalizeAddress(ethers, taskArgs.to)
      debug(`Normalized to address: ${to}`)
    }

    const txRequest = {
      from: await fromSigner.getAddress(),
      to,
      value: parseUnits(
        taskArgs.amount ? taskArgs.amount : '0',
        'ether',
      ).toHexString(),
      nonce: await fromSigner.getTransactionCount(),
      gasPrice: parseUnits(
        taskArgs.gasPrice ? taskArgs.gasPrice : '1.001',
        'gwei',
      ).toHexString(),
      gasLimit: taskArgs.gasLimit ? taskArgs.gasLimit : 24000,
      chainId: network.config.chainId,
    }

    if (taskArgs.data !== undefined) {
      txRequest.data = taskArgs.data
      debug(`Adding data to payload: ${txRequest.data}`)
    }
    debug(txRequest.gasPrice / 1000000000 + ' gwei')
    debug(JSON.stringify(txRequest, null, 2))

    return sendTx(fromSigner, txRequest)
  })
