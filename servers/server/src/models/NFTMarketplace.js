import { Sequelize } from 'sequelize'

import sequelize from './sequelize'
import { Users } from './users'

export const Collections = sequelize.define('Collections', {
  collection_id: {
    type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false,
  },
  name: { type: Sequelize.TEXT, allowNull: false },
  creator: { type: Sequelize.TEXT, allowNull: false },
  contract_address: { type: Sequelize.TEXT, allowNull: false },
  description: { type: Sequelize.TEXT, allowNull: true },
  no_items: { type: Sequelize.INTEGER, allowNull: false },
  no_owners: { type: Sequelize.INTEGER, allowNull: false },
  floor_price: { type: Sequelize.DOUBLE, allowNull: false },
  volume_traded: { type: Sequelize.DOUBLE, allowNull: false },
  website: { type: Sequelize.TEXT, allowNull: true },
  discord: { type: Sequelize.TEXT, allowNull: true },
  instagram: { type: Sequelize.TEXT, allowNull: true },
  twitter: { type: Sequelize.TEXT, allowNull: true },
}, {
  timestamps: true,
  underscored: true,
})

export const Assets = sequelize.define('Assets', {
  item_id: { type: Sequelize.BIGINT, allowNull: false, primaryKey: true },
  name: { type: Sequelize.TEXT, allowNull: false },
  meta_url: { type: Sequelize.TEXT, allowNull: false },
  asset_contract: { type: Sequelize.TEXT, allowNull: false },
  creator: { type: Sequelize.TEXT, allowNull: false },
  current_owner: { type: Sequelize.TEXT, allowNull: false },
  listing_status: { type: Sequelize.BOOLEAN, allowNull: false },
  quantity: { type: Sequelize.INTEGER, allowNull: false },
  token_id: { type: Sequelize.BIGINT, allowNull: false },
  royalty: { type: Sequelize.INTEGER, allowNull: false },
  currency: { type: Sequelize.TEXT, allowNull: false },
  price: { type: Sequelize.BIGINT, allowNull: false },
  likes: { type: Sequelize.BIGINT, allowNull: false },
}, {
  timestamps: true,
  underscored: true,
})

Assets.belongsTo(Collections, { foreignKey: 'collection_id' })

// Join Table for Likes
export const UserLikesAsset = sequelize.define('UserLikesAsset')
// Join Table for Favorites
export const UserFavoritesCollection = sequelize.define('UserFavoritesCollection')

// Making the many to many connections
Users.belongsToMany(Assets, { through: UserLikesAsset })
Assets.belongsToMany(Users, { through: UserLikesAsset })

Users.belongsToMany(Collections, { through: UserFavoritesCollection })
Collections.belongsToMany(Users, { through: UserFavoritesCollection })

// user.addAssets(asset); To map a like

export default sequelize
