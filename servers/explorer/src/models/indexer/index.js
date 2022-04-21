import { Sequelize } from 'sequelize'

import envVars from '../../config/envVars'
import logger from '../../utils/logger'
import { attributes as blockAttributes, options as blockOptions } from './Blocks'
import { attributes as txAttributes, options as txOptions } from './Transactions'

const sequelize = new Sequelize(envVars.db.dbname, envVars.db.user, envVars.db.password, {
  dialect: envVars.db.dialect,
  // dialectOptions: { decimalNumbers: true },
  host: envVars.db.host,
  logger: (msg) => logger.debug(msg),
  logging: false,
  pool: envVars.db.pool,
  port: envVars.db.sequelize_port,
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

export default sequelize
