import { Sequelize } from 'sequelize'

import envVars from '../config/envVars'

const models = {}

const sequelize = new Sequelize(envVars.db.dbname, envVars.db.user, envVars.db.password, {
  host: envVars.db.host,
  dialect: envVars.db.dialect,
  pool: envVars.db.pool,
  port: envVars.db.sequelize_port,
  // logging: false,
  logging: true,
})

Object.keys(models).forEach((modelName) => {
  models[modelName] = sequelize.define(modelName, models[modelName])
})

export { models }

export default sequelize
