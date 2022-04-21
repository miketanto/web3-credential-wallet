import { Sequelize } from 'sequelize'

// Camelcase naming
export const attributes = {
  chainId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  // The difficulty target required to be met by the miner of the block.
  difficulty: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },
  // This is extra data a miner may choose to include when mining a block.
  extraData: {
    type: Sequelize.CITEXT,
    allowNull: true,
  },
  // The maximum amount of gas that this block was permitted to use. This is a value that can be voted up or voted
  // down by miners and is used to automatically adjust the bandwidth requirements of the network.
  gasLimit: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },
  // The total amount of gas used by all transactions in this block.
  gasUsed: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },
  // The hash of this block.
  hash: { // hex
    type: Sequelize.CITEXT,
    allowNull: false,
    primaryKey: true,
  },
  // The coinbase address of this block, which indicates the address the miner that
  // mined this block would like the subsidy reward to go to.
  miner: { // hex
    type: Sequelize.CITEXT,
    allowNull: false,
  },
  // The nonce used as part of the proof-of-work to mine this block.
  nonce: {
    type: Sequelize.CITEXT,
    allowNull: false,
  },
  // Block height
  number: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  // The hash of the previous block.
  parentHash: {
    type: Sequelize.CITEXT,
    allowNull: false,
  },
  timestamp: {
    type: Sequelize.DATE,
    allowNull: false,
  },
}

export const options = {
  // bigNumberStrings: true,
  createdAt: false,
  supportBigNumbers: true,
  timestamps: false,
  updatedAt: false,
  underscored: false,
}
