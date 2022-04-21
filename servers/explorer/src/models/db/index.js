import { Sequelize } from 'sequelize'

import { envVars } from '../../config'
import logger from '../../utils/logger'

const sequelize = new Sequelize(envVars.db.dbname, envVars.db.user, envVars.db.password, {
  dialect: envVars.db.dialect,
  // dialectOptions: { decimalNumbers: true },
  host: envVars.db.host,
  logger: (msg) => logger.debug(msg),
  logging: false,
  pool: envVars.db.pool,
  port: envVars.db.sequelize_port,
})

/**
 * With underscored = true, Sequelize will instead define:
 *
 * - A `createdAt` attribute for each model, pointing to a column named `created_at` in each table
 * - An `updatedAt` attribute for each model, pointing to a column named `updated_at` in each table
 * - A `userId` attribute in the Task model, pointing to a column named `user_id` in the task table
 */

export const Users = sequelize.define('Users', {
  email: { type: Sequelize.TEXT, allowNull: false, primaryKey: true },
  oid: { type: Sequelize.UUID, allowNull: false },
  net_id: { type: Sequelize.TEXT, allowNull: false },
  first_name: { type: Sequelize.TEXT, allowNull: false },
  last_name: { type: Sequelize.TEXT, allowNull: false },
}, {
  timestamps: true,
  underscored: true,
})

export const Addresses = sequelize.define('Addresses', {
  email: { type: Sequelize.TEXT, allowNull: false },
  net_id: { type: Sequelize.TEXT, allowNull: false },
  address: { type: Sequelize.TEXT, allowNull: false, primaryKey: true },
}, {
  timestamps: true,
  underscored: true,
})

export const Replenishes = sequelize.define('Replenishes', {
  address: { type: Sequelize.TEXT, allowNull: false, primaryKey: true },
}, {
  timestamps: true,
  underscored: true,
})

export default sequelize
