import { Sequelize } from 'sequelize'

// Camelcase naming
// https://docs.ethers.io/v5/api/providers/types/#providers-TransactionResponse
// inherits https://docs.ethers.io/v5/api/utils/transactions/#Transaction
export const attributes = {
  block: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  blockHash: {
    type: Sequelize.CITEXT,
    allowNull: false,
  },
  chainId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  // Sum of gasUsed by this transaction and all preceding transactions in the same block.
  cumulativeGasUsed: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },
  // The data for transaction. In a contract this is the call data. => BytesLike
  data: { // hex
    type: Sequelize.CITEXT,
    allowNull: true,
  },
  effectiveGasPrice: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },
  // Address transaction is from
  from: { // hex
    type: Sequelize.CITEXT,
    allowNull: false,
  },
  // Gas limit for transaction. An account must have enough ether to cover the gas (at the specified gasPrice)
  gasLimit: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },
  // The price (in wei) per unit of gas for transaction.
  gasPrice: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },
  hash: { // hex
    type: Sequelize.CITEXT,
    allowNull: false,
    primaryKey: true,
  },
  // Is the transaction an init tx (used to deploy a contract)?
  initTransaction: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  nonce: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },
  // Transaction receipt status (1: mined/sent, 2: pending)
  status: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  // Address this transaction is to. Can also be an init transaction (used to deploy a contract).
  to: { // hex
    type: Sequelize.CITEXT,
    allowNull: false,
  },
  txIndex: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  value: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },
}

export const options = {
  indexes: [
    {
      // TODO: Incorporate chain id as well
      name: 'txByBlock',
      using: 'BTREE',
      fields: ['hash', 'block'],
    },
    {
      name: 'txFromIndex',
      using: 'BTREE',
      fields: ['from'],
    },
    {
      name: 'txToIndex',
      using: 'BTREE',
      fields: ['to'],
    },
  ],
  // bigNumberStrings: true,
  createdAt: false,
  supportBigNumbers: true,
  timestamps: false,
  updatedAt: false,
  underscored: false,
}
