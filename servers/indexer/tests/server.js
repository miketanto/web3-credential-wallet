import express from 'express'
import morgan from 'morgan'

import sequelize, { Transactions } from '../src/models'

const PORT = 3000

const app = express()

app.use(morgan('tiny'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/latest', async (req, res) => {
  const records = await Transactions.findAll({
    limit: 10,
    order: [['nonce', 'DESC']],
  })

  res.json(records)
})

app.get('/from', async (req, res) => {
  const { address } = req.query
  if (address === undefined) return res.json({ status: 'error', error: 'field `address` is missing' })

  const records = await Transactions.findAll({
    limit: 5,
    where: {
      from: address,
    },
    order: [['nonce', 'DESC']],
  })

  res.json(records)
})

app.get('/to', async (req, res) => {
  const { address } = req.query
  if (address === undefined) return res.json({ status: 'error', error: 'field `address` is missing' })

  const records = await Transactions.findAll({
    limit: 5,
    where: {
      to: address,
    },
    order: [['nonce', 'DESC']],
  })

  res.json(records)
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
