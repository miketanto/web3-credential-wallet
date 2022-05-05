const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const { MAINNET_GWEI, TARGET_NETWORK } = require('./constants')

function mnemonic() {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../mnemonic.txt')).toString().trim()
  } catch (e) {
    console.log(e)
    if (TARGET_NETWORK !== 'localhost') {
      console.log('☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`.')
    }
  }
  return ''
}

module.exports = {
  localhost: {
    url: 'http://localhost:8545',
  },
  iblockdev: {
    url: 'http://141.142.218.249:10000',
    gasPrice: 100000,
    accounts: [
      process.env.IBLOCK_DEV_PRIV_KEY,
    ],
  },
  // rinkeby: {
  //   url: 'https://rinkeby.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', // <---- YOUR INFURA ID! (or it won't work)
  //   //    url: "https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXXXXX/eth/rinkeby", // <---- YOUR MORALIS ID! (not limited to infura)
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  // },
  // kovan: {
  //   url: 'https://kovan.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', // <---- YOUR INFURA ID! (or it won't work)
  //   //    url: "https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXXXXX/eth/kovan", // <---- YOUR MORALIS ID! (not limited to infura)
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  // },
  // mainnet: {
  //   url: 'https://mainnet.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', // <---- YOUR INFURA ID! (or it won't work)
  //   //      url: "https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXXXXXXX/eth/mainnet", // <---- YOUR MORALIS ID! (not limited to infura)
  //   gasPrice: MAINNET_GWEI * 1000000000,
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  // },
  // ropsten: {
  //   url: 'https://ropsten.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', // <---- YOUR INFURA ID! (or it won't work)
  //   //      url: "https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXXXXXXX/eth/ropsten",// <---- YOUR MORALIS ID! (not limited to infura)
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  // },
  // goerli: {
  //   url: 'https://goerli.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', // <---- YOUR INFURA ID! (or it won't work)
  //   //      url: "https://speedy-nodes-nyc.moralis.io/XXXXXXXXXXXXXXXXXXXXXXXXX/eth/goerli", // <---- YOUR MORALIS ID! (not limited to infura)
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  // },
  // xdai: {
  //   url: 'https://rpc.xdaichain.com/',
  //   gasPrice: 1000000000,
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  // },
  // fantom: {
  //   url: 'https://rpcapi.fantom.network',
  //   gasPrice: 1000000000,
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  // },
  // testnetFantom: {
  //   url: 'https://rpc.testnet.fantom.network',
  //   gasPrice: 1000000000,
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  // },
  polygon: {
    url: 'https://polygon-rpc.com',
    gasPrice: 35000000000,
    // accounts: {
    //   mnemonic: mnemonic(),
    // },
    accounts: [
      process.env.POLYGON_PRIV_KEY,
    ],
  },
  mumbai: {
    url: 'https://rpc-mumbai.maticvigil.com',
    gasPrice: 3200000000,
    // accounts: {
    //   mnemonic: mnemonic(),
    // },
    accounts: [
      process.env.MUMBAI_DUMMY_PRIV_KEY,
    ],
  },
  // matic: {
  //   url: 'https://rpc-mainnet.maticvigil.com/',
  //   gasPrice: 1000000000,
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  // },
  // rinkebyArbitrum: {
  //   url: 'https://rinkeby.arbitrum.io/rpc',
  //   gasPrice: 0,
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  //   companionNetworks: {
  //     l1: 'rinkeby',
  //   },
  // },
  // localArbitrum: {
  //   url: 'http://localhost:8547',
  //   gasPrice: 0,
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  //   companionNetworks: {
  //     l1: 'localArbitrumL1',
  //   },
  // },
  // localArbitrumL1: {
  //   url: 'http://localhost:7545',
  //   gasPrice: 0,
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  //   companionNetworks: {
  //     l2: 'localArbitrum',
  //   },
  // },
  // optimism: {
  //   url: 'https://mainnet.optimism.io',
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  //   companionNetworks: {
  //     l1: 'mainnet',
  //   },
  // },
  // kovanOptimism: {
  //   url: 'https://kovan.optimism.io',
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  //   companionNetworks: {
  //     l1: 'kovan',
  //   },
  // },
  // localOptimism: {
  //   url: 'http://localhost:8545',
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  //   companionNetworks: {
  //     l1: 'localOptimismL1',
  //   },
  // },
  // localOptimismL1: {
  //   url: 'http://localhost:9545',
  //   gasPrice: 0,
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  //   companionNetworks: {
  //     l2: 'localOptimism',
  //   },
  // },
  // localAvalanche: {
  //   url: 'http://localhost:9650/ext/bc/C/rpc',
  //   gasPrice: 225000000000,
  //   chainId: 43112,
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  // },
  // fujiAvalanche: {
  //   url: 'https://api.avax-test.network/ext/bc/C/rpc',
  //   gasPrice: 225000000000,
  //   chainId: 43113,
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  // },
  // mainnetAvalanche: {
  //   url: 'https://api.avax.network/ext/bc/C/rpc',
  //   gasPrice: 225000000000,
  //   chainId: 43114,
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  // },
  // testnetHarmony: {
  //   url: 'https://api.s0.b.hmny.io',
  //   gasPrice: 1000000000,
  //   chainId: 1666700000,
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  // },
  // mainnetHarmony: {
  //   url: 'https://api.harmony.one',
  //   gasPrice: 1000000000,
  //   chainId: 1666600000,
  //   accounts: {
  //     mnemonic: mnemonic(),
  //   },
  // },
}
