'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');

const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp)

const {app, startServer, stopServer} = require("../server")
const {TEST_DATABASE_URL} = require("../config")

describe('Word API', function() {
  it('should 401 on GET requests due to not auth', function() {
    return chai.request(app)
      .get('/api/words/food')
      .then(function(res) {
        res.should.have.status(401)
      });
  });
});

describe("Testing front end with GET", function(){
  before(function() {
      return startServer(TEST_DATABASE_URL)
  })
  after(function(){
      return stopServer()
  })
  describe("Testing on GET for home page", function(){
      it("should get 404 status on GET for home page", function(){
          return chai.request(app)
          .get("/")
          .then(function(res){
              expect(res).to.have.status(404)
          })
      })
  })
  describe("Testing on GET for non existing page", function(){
      it("should get 404 status on GET for non existing page", function(){
          return chai.request(app)
          .get("/nothingToSee")
          .then(function(res){
              expect(res).to.have.status(404)
          })
      })
  })
  describe("Testing on GET for open game", function(){
    it("should get 200 status on GET for open game", function(){
        return chai.request(app)
        .get("/api/games")
        .then(function(res){
            expect(res).to.have.status(200)
        })
    })
  })
  describe("Testing on CRUD for user", function(){
    it("should get 201 status on POST for new user", function(){
        //chai agent for cookie auth
        const agent = chai.request.agent(app)
        return agent
        .post("/api/users")
        .send({
          userName: 'user',
          password: 'password'
        })
        .then(function(res){
            expect(res).to.have.status(201)
            return agent
            .post("/api/auth/login")
            .send({
              userName: 'user',
              password: 'password'
            })
            .then(function(res){
                expect(res).to.have.status(200)
                expect(res).to.have.cookie('authToken');
                return agent
                .delete(`/api/users/${res.body.validUser._id}`)
                .then(function(res){
                    expect(res).to.have.status(200)
                    agent.close()
                })
            })
        })
    })
  })
})