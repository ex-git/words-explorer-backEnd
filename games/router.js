'use strict'

const express = require('express')
const gamesRouter = express.Router();


const passport = require('passport')
const jwtAuth = passport.authenticate('jwt', {session: false});

const {Game} = require('../models')

//body parser
gamesRouter.use(express.json())

gamesRouter.get("/", (req, res)=>{
    Game.find({gameStatus: 'open'}, {gameId:1})
    .then(games=>{
        if(games) {
            let openingGame = games.map(game=> game.gameId)
            res.status(200).json(openingGame)
        }
        else {
            res.status(404).json({
                status: 404,
                reason: 'NotFound',
                message: `Couldn't find the game with the ID provided`})
        }
    })
})

gamesRouter.get("/user/:user", jwtAuth, (req, res)=>{
    Game.find({creator: req.params.user}, {gameId:1, _id:1, questions:1})
    .then(games=>{
        if(games.length>0) {
            res.status(200).json(games)
        }
        res.status(200).json([])
    })
    .catch(()=> null)
})

gamesRouter.get("/:id", jwtAuth, (req, res)=>{
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
    .catch(err=>{
        res.status(500).json({
            status: 500,
            reason: 'ServerError',
            message: 'Server error'
        })
    })
})
gamesRouter.post("/", jwtAuth, (req, res)=>{
    if(req.body && req.body.length>0) {
        req.body.forEach(question=>{
            if (!('question' in question)) {
                return res.status(422).json({
                    status: 422,
                    reason: 'ValidationError',
                    message: 'Missing field'
                })
            }
        })
    }
    let newGame = {
        creator: req.user._id,
        gameId: new Date().getTime().toString(),
        questions: req.body
    }
    Game.create(newGame)
    .then(game=>{
        res.status(201).json(game)
    })
    .catch(err=>{
        console.info(err)
        res.status(500).json({
            status: 500,
            reason: 'ServerError',
            message: 'Server error'
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
gamesRouter.put("/:id", jwtAuth, (req, res)=>{
    const acceptFields = ['gameStatus', 'answersReceived', 'players', 'join']
    const submittedFields = acceptFields.filter(field=> field in req.body)
    if (submittedFields.length===0) {
        return res.status(422).json({
            status: 422,
            reason: 'ValidationError',
            message: 'Unacceptable field'
        })
    }
    if (submittedFields.length===1 && submittedFields.includes('join')) {
        if(req.body.join === 'yes'){
            Game.findOne({gameId: req.params.id})
            .then(game=>{
                if(game) {
                    //prevent double join
                    if(game.players.includes(req.user.userName) || game.gameStatus !== 'open') {
                        console.info('already loged in', req.user.userName)
                        return res.status(200).json(game)
                    }
                    else {
                        Game.findOneAndUpdate({gameId: req.params.id}, {$set: {players: [...game.players, req.user.userName]}}, {new: true})
                        .then(newGame=> {
                            console.info('returning joined game')
                            return res.status(200).json(newGame)
                        })
                        .catch(()=>{
                            res.status(500).json({
                                status: 500,
                                reason: 'ServerErr',
                                message: 'Unable to add to game'
                            })
                        })
                    }
                }
                else {
                    return new Promise.reject()
                }
            })
            .catch(()=>{
                res.status(500).json({
                    status: 500,
                    reason: 'ServerErr',
                    message: 'Unable to join'
                })
            })
        }
        else if (req.body.join === 'no' && req.params.id) {
            Game.findOne({gameId: req.params.id})
            .then(game=>{
                if(game) {
                    if(game.players.filter(player=> player !== req.user.userName).length===0) {
                        Game.findOneAndUpdate({gameId: req.params.id}, {$set: {gameStatus: 'open', players: game.players.filter(player=> player !== req.user.userName)}})
                        .then(newGame=> {
                            return res.status(200).end
                        })
                        .catch(()=>{
                            res.status(503).json({
                                status: 500,
                                reason: 'ServerErr',
                                message: 'Unable to exit'
                            })
                        })
                    }
                    else {
                        Game.findOneAndUpdate({gameId: req.params.id}, {$set: {players: game.players.filter(player=> player !== req.user.userName)}})
                        .then(newGame=> {
                            return res.status(200).end
                        })
                        .catch(()=>{
                            res.status(500).json({
                                status: 500,
                                reason: 'ServerErr',
                                message: 'Unable to exit'
                            })
                        })
                    }
                }
                else {
                    res.status(500).json({
                        status: 500,
                        reason: 'ServerErr',
                        message: 'Unable to exit'
                    })
                }
            })
        }
        else {
            res.status(500).json({
                status: 500,
                reason: 'ServerErr',
                message: 'Unable to exit'
            })
        }
    }
    else {
        Game.findOneAndUpdate({gameId: req.params.id}, {$set: req.body}, {new: true})
        .then(game=> {
            //check if all players offline and reset game to open
            if(game.gameStatus !== 'open') {
                let resetGame = setTimeout(function(){
                    console.info('here i am')
                    clearInterval(timeCheck)
                    return Game.findOneAndUpdate({gameId: req.params.id}, {$set: {gameStatus: 'open', players: [], answersReceived: {}}})
                    .then(()=>null)
                }, 40 * 1000)
                
                let timeCheck = setInterval(function(){
                    Game.findOne({gameId: req.params.id})
                    .then(game2=>{
                        if (game2.gameStatus !== game.gameStatus) {
                            console.info('ok, new status received, leaving')
                            clearInterval(timeCheck)
                            clearTimeout(resetGame)
                        }
                        return
                    })
                }, 2000)
            }
            return res.status(200).end()
        })
        .catch(()=>{
            res.status(500).json({
                status: 500,
                reason: 'ServerErr',
                message: 'Unable to update'
            })
        })
    }
})

gamesRouter.delete("/:id", jwtAuth, (req, res)=>{
    Game.findOneAndDelete(req.params.id)
    .then(game=>{
        console.info(game)
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