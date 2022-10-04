import { Sequelize } from 'sequelize'

import sequelize from './sequelize'

export const Users = sequelize.define('Users', {
    email: { type: Sequelize.TEXT, allowNull: false, primaryKey: true },
    uin:{type: Sequelize.TEXT, allowNull:false},
    net_id: { type: Sequelize.TEXT, allowNull: false },
    first_name: { type: Sequelize.TEXT, allowNull: false },
    last_name: { type: Sequelize.TEXT, allowNull: false },
    major: { type: Sequelize.TEXT, allowNull: false },
    headline: { type: Sequelize.TEXT, allowNull: false },
    gender: { type: Sequelize.TEXT, allowNull: false },
    linkedin: { type: Sequelize.TEXT, allowNull: false },
    github: { type: Sequelize.TEXT, allowNull: false },
    graduation_date: {type: Sequelize.DATE, allowNull:false},
    oid: { type: Sequelize.UUID, allowNull: false },
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

  Users.hasOne(Wallets)
  Wallets.belongsTo(Users)