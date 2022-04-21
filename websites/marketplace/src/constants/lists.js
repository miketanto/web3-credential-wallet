const IBLOCK_LIST = 'https://tokens.iblockcore.com/'
const IBLOCK_DEV_LIST = 'https://tokens.dev.iblockcore.com/'

// const BA_LIST = 'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json'
export const UNSUPPORTED_LIST_URLS = [] // [BA_LIST]

// this is the default list of lists that are exposed to users
// lower index == higher priority for token import
const DEFAULT_LIST_OF_LISTS_TO_DISPLAY = [
  process.env.NODE_ENV === 'production' ? IBLOCK_LIST : IBLOCK_DEV_LIST,
]

export const DEFAULT_LIST_OF_LISTS = [
  ...DEFAULT_LIST_OF_LISTS_TO_DISPLAY,
  ...UNSUPPORTED_LIST_URLS, // need to load dynamic unsupported tokens as well
]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS = DEFAULT_LIST_OF_LISTS_TO_DISPLAY
