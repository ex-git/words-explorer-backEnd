'use strict'

const express = require('express')
const gamesRouter = express.Router();


const {Game, User} = require('../models')

// // const passport = require('passport')
// const jwtAuth = passport.authenticate('jwt', {session: false});

//body parser
// gamesRouter.use(express.json())

// gamesRouter.get("/", jwtAuth, (req, res)=>{

gamesRouter.get("/:id", (req, res)=>{
    Game.findOne({gameId: req.params.id})
    .then(game=>{
        if(game) {
            res.status(200).json(game)
        }
        else {
            res.status(404).json({
                status: 404,
                reason: 'NotFound',
                message: `Couldn't find the game with the ID provided`})
        }
    })
})
gamesRouter.post("/", (req, res)=>{
    const requredFields = 'questions'
    const missingField = requredFields.find(field=> !(field in req.body))
    if (missingField) {
        return res.status(422).json({
            status: 422,
            reason: 'ValidationError',
            message: 'Missing field'
        })
    }
    let newGame = {
        creator,
        gameStatus,
        gameId,
        questions: [
            {word: {type: String,  required:true},
            question: {type: Array, required:true},
            correctAnswer: {type: String, required:true}
            }
    ],
    currentQuestion,
    timeOutUser,
    answerReceived,
    players
    }
    User.findOne({name: req.body.userName}, {_id: 1})
    .then(user=>{
        newGame.creator = user._id
        Game.create(newGame)
        .then(game=>{
            res.status(201).json(game)
        })
        .catch(err=>{
            res.status(500).json({
                status: 500,
                reason: 'ServerError',
                message: 'Server error'
            })
        })
    })
    .catch(()=>{
        res.status(400).json({
            status: 400,
            reason: 'UserNotFound',
            message: 'Invalid User'
        })
    })
})
gamesRouter.put("/:id", (req, res)=>{
    const requredFields = 'questions'
    const missingField = requredFields.find(field=> !(field in req.body))
    if (missingField) {
        return res.status(422).json({
            status: 422,
            reason: 'ValidationError',
            message: 'Missing field'
        })
    }
    let newGame = {}
    Object.keys(req.body).forEach(field=>{
        newGame[field] = req.body.field
    })
    Game.findOneAndUpdate({gameId: req.params.id}, {$set: newGame})
    .then(game=>{
        res.status(200).end()
    })
    .catch(()=>{
        res.status(500).json({
            status: 500,
            reason: 'ServerErr',
            message: 'Unable to update'
        })
    })
})
gamesRouter.delete("/:id", (req, res)=>{
    Game.findOneAndRemove({gameId: req.params.id})
    .then(game=>{
        res.status(200).end()
    })
    .catch(()=>{
        res.status(500).json({
            status: 500,
            reason: 'ServerErr',
            message: 'Unable to delete'
        })
    })
})

module.exports = {gamesRouter}