import { Sequelize } from 'sequelize'

import sequelize from './sequelize'

export const SummitAddresses = sequelize.define('SummitAddresses', {
  email: { type: Sequelize.TEXT, allowNull: false, primaryKey: true },
  address: { type: Sequelize.TEXT, allowNull: false, uniqueKey: true },
}, {
  timestamps: true,
  underscored: true,
})
