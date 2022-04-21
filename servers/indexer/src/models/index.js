import { Sequelize } from 'sequelize'

import envVars from '../config/envVars'
import logger from '../utils/logger'
import { attributes as blockAttributes, options as blockOptions } from './Blocks'
import { attributes as txAttributes, options as txOptions } from './Transactions'

const sequelize = new Sequelize(envVars.DB_NAME, envVars.DB_USERNAME, envVars.DB_PASSWORD, {
  dialect: 'postgres',
  host: envVars.DB_HOST,
  logger: (msg) => logger.debug(msg),
  logging: false,
  // Even though the actual postgres exposed port is different, Dockerfile works on the same network
  // so the internal port between the DB & indexer remains the default -- 5432
  port: 5432,
})

//
// Make sure to execute on Postgres server cli:
// \c db_name
// CREATE EXTENSION citext;
//
export const Blocks = sequelize.define('Blocks', blockAttributes, blockOptions)
export const Transactions = sequelize.define('Transactions', txAttributes, txOptions)

//
// Define Table Relations
// - Do both 'belongsTo' and 'hasMany' to strongly define the relationship
// - Use Sequelize.col('Table.Column') for hasMany to avoid ambiguous relations (ie. tables have same-name cols)
//
// * Foreign Key (FK) from Transactions.blockHash to Blocks.hash
Transactions.belongsTo(Blocks, { as: 'blockTx', foreignKey: 'blockHash', targetKey: 'hash' })
Blocks.hasMany(Transactions, { foreignKey: 'blockHash', targetKey: Sequelize.col('Blocks.hash') })

// sequelize.models = { Blocks, Transactions }
export default sequelize
