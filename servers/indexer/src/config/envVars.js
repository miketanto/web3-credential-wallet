import dotenv from 'dotenv'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { IS_PRODUCTION } from '../utils/constants'

const __dirname = dirname(fileURLToPath(import.meta.url))

// This config must come before all other imports that rely on process.env
//  and any variables that use process.env (other than IS_PRODUCTION)
dotenv.config({ path: path.join(__dirname, '../../.env') })

export default {
  DB_HOST: IS_PRODUCTION ? process.env.DB_HOST : process.env.DB_DEV_HOST,
  DB_NAME: IS_PRODUCTION ? process.env.DB_NAME : process.env.DB_DEV_NAME,
  DB_PASSWORD: IS_PRODUCTION ? process.env.DB_PASSWORD : process.env.DB_DEV_PASSWORD,
  DB_EXTERNAL_PORT: IS_PRODUCTION ? process.env.DB_EXTERNAL_PORT : process.env.DB_DEV_EXTERNAL_PORT,
  DB_USERNAME: IS_PRODUCTION ? process.env.DB_USERNAME : process.env.DB_DEV_USERNAME,
}
