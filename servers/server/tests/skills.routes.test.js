/* eslint-disable linebreak-style */
// Import the dependencies for testing
import chai from 'chai'
import chaiHttp from 'chai-http'
import { testapp as app } from '../src/index'
// Configure chai
chai.use(chaiHttp)
chai.should()

describe('Skills', () => {
  describe('GET /skill/list', () => {
    it('Should list all available skills', (done) => {
      chai.request(app)
        .get('/skill/list')
        .end((err, res) => {
          // res.should.have.status(200)
          console.log(res.body.payload)
          res.body.payload.should.be.a('object')
          done()
        })
    })
  })
  /* describe('GET /user/search', () => {
    // Test to get all students record
    it('should not get a users wallet address', (done) => {
      chai.request(app)
        .get('/user/search')
        .query({ email: 'sutanto4@illinois.edu' })
        .end((err, res) => {
          res.should.have.status(200)
          res.body.msg.should.be.equal('User not found')
          res.body.payload.should.be.a('object')
          done()
        })
    })
  }) */
})
