/**
 * Mocking client-server processing
 */

// List to display at the front
const mainList = [{
  name: 'Home',
  href: '/',
}, {
  name: 'Blocks',
  href: '/blocks',
}, {
  name: 'Transactions',
  href: '/txs',
}]

const marketplaceList = [{
  name: 'Explore',
  href: '/',
}, {
  name: 'Create',
  href: '/createNFT',
}, {
  name: 'Dashboard',
  href: '/creatorDashboard',
}]

// const dropdownList = {
//   more: {
//     left: [{
//       name: 'About',
//     }, {
//       divider: true,
//     }, {
//       name: 'Contact',
//     }],
//   },
// }

const TIMEOUT = 0 // no fake timeout for now

async function getMainNav() {
  await new Promise((resolve) => setTimeout(resolve, TIMEOUT))
  return {
    mainList,
  }
}

async function getMarketNav() {
  await new Promise((resolve) => setTimeout(resolve, TIMEOUT))
  return {
    marketplaceList,
  }
}

export default {
  // eslint-disable-next-line import/prefer-default-export
  getMainNav,
  getMarketNav,
}
