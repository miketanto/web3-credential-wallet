import path from 'path'
import fs from 'fs'

export const requireFilesInDirectory = (directory, exclude = []) => {
  if (!exclude.includes('index.js')) exclude.push('index.js')
  const srcPath = path.join(__dirname, '..')
  const relPath = path.join(srcPath, directory)
  fs.readdirSync(relPath).forEach((file) => {
    if (exclude.includes(file)) return
    // eslint-disable-next-line global-require,import/no-dynamic-require
    require(path.join(relPath, file))
  })
}

export * from './auth'
export { default as catchAsync } from './catchAsync'
export * from './helpers'
export { default as logger } from './logger'
export { default as pick } from './pick'
export * as web3 from './web3'
export { default as ApiError } from './ApiError'
