import { Sequelize } from 'sequelize'
import { Users, Wallets } from './users'
import sequelize from './sequelize'

/**
 * With underscored = true, Sequelize will instead define:
 *
 * - A `createdAt` attribute for each model, pointing to a column named `created_at` in each table
 * - An `updatedAt` attribute for each model, pointing to a column named `updated_at` in each table
 * - A `userId` attribute in the Task model, pointing to a column named `user_id` in the task table
 */

export const Skills = sequelize.define('Skills', {
  token_id: { type: Sequelize.INTEGER,autoIncrement: true, primaryKey: true},
  name: { type: Sequelize.TEXT, allowNull: false },
  type: {type: Sequelize.TEXT, allowNull:false},
  description: { type: Sequelize.TEXT, allowNull: false },
  submitter: { type: Sequelize.TEXT, allowNull: false },
  tx_hash: { type: Sequelize.CITEXT, allowNull: false },
  status: { type: Sequelize.TEXT, allowNull: false, defaultValue: 'pending' },
}, {
  timestamps: true,
  underscored: true,
})

export const Experiences = sequelize.define('Experience', {
  id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
  title: { type: Sequelize.TEXT, allowNull: false },
  role: { type: Sequelize.TEXT, allowNull: false },
  description:  { type: Sequelize.TEXT, allowNull: false }
}, {
  timestamps: true,
  underscored: true,
})

export const Projects = sequelize.define('Projects', {
  id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
  title: { type: Sequelize.TEXT, allowNull: false },
  type: { type: Sequelize.TEXT, allowNull: false },
  description:  { type: Sequelize.TEXT, allowNull: false }
}, {
  timestamps: true,
  underscored: true,
})
// TODO: Define foreign key relations
Skills.belongsToMany(Users, {
  through: "user_skills",
  as: "users",
  foreignKey: "skill_id",
});

Users.belongsToMany(Skills, {
  through: "user_skills",
  as: "skills",
  foreignKey: "user_id",
});

Users.hasMany(Experiences)
Users.hasMany(Projects)