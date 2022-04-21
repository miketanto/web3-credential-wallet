import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { transports, createLogger, format } from 'winston'

import { IS_PRODUCTION } from './constants'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const serviceName = IS_PRODUCTION ? 'indexer' : 'indexer-dev'
const logger = createLogger({
  level: 'info',
  format: format.combine(
    // format.errors({ stack: true }),
    format.timestamp(),
    format.json(),
  ),
  defaultMeta: { service: serviceName },
  transports: [
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    new transports.Console({ format: format.simple() }),
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new transports.File({ filename: path.join(__dirname, '../../logs/error.log'), level: 'error' }),
    new transports.File({ filename: path.join(__dirname, '../../logs/combined.log') }),
  ],
})

export default logger
