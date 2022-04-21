import { Sequelize } from 'sequelize'

import sequelize from './sequelize'

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

export const Wallets = sequelize.define('Wallets', {
  email: { type: Sequelize.TEXT, allowNull: false },
  main_address: { type: Sequelize.TEXT, allowNull: false, primaryKey: true },
  seed_phrase: { type: Sequelize.TEXT, allowNull: false, uniqueKey: true },
}, {
  timestamps: true,
  underscored: true,
})

export const Skills = sequelize.define('Skills', {
  token_id: { type: Sequelize.TEXT, allowNull: true },
  name: { type: Sequelize.TEXT, allowNull: false },
  description: { type: Sequelize.TEXT, allowNull: false },
  submitter: { type: Sequelize.TEXT, allowNull: false },
  tx_hash: { type: Sequelize.CITEXT, allowNull: false },
  status: { type: Sequelize.TEXT, allowNull: false, defaultValue: 'pending' },
}, {
  timestamps: true,
  underscored: true,
})

// TODO: Define foreign key relations
