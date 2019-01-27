'use strict'

const express = require('express')
const usersRouter = express.Router();


const {Game, User} = require('../models')

const passport = require('passport')
const jwtAuth = passport.authenticate('jwt', {session: false});

//body parser
// usersRouter.use(express.json())

//usersRouter.get("/", jwtAuth, (req, res)=>{

usersRouter.get("/", (req, res)=>{
    User.find({}, {password:0})
    .then(users=>{
        if(users.length>0) {
            let usersRank = users.map(user=>{
                return {name: user.userName,
                score: user.scores || 0}
            })
            res.status(200).json(usersRank)
        }
        else {
            res.status(404).json({
                status: 404,
                reason: 'NotFound',
                message: `Nothing found`})
        }
    })
})

usersRouter.get("/:id", (req, res)=>{
    User.findOne({userName: req.params.id}, {password:0})
    .then(user=>{
        if(user) {
            res.status(200).json({
                user: user.userName
            })
        }
        else {
            res.status(404).json({
                status: 404,
                reason: 'NotFound',
                message: `Couldn't find the user`})
        }
    })
})

usersRouter.post("/", (req, res)=>{
    const requredFields = ['userName', 'password']
    const missingField = requredFields.find(field=> !(field in req.body))
    if (missingField) {
        return res.status(422).json({
            status: 422,
            reason: 'ValidationError',
            message: 'Missing field'
        })
    }
    User.findOne({userName: req.body.userName})
    .then(user=>{
        if(user) {
            return res.status(422).json({
                status: 422,
                reason: 'UserExist',
                message: `User Name ${req.body.userName} Already Been Registered`
            })
        }
        User.hashPassword(req.body.password)
        .then(hashedPassword=>{
            let newUser = {
                userName:req.body.userName,
                password: hashedPassword
            }
            User.create(newUser)
            .then(user=>{
                res.status(201).json({
                    status: 201,
                    message: `User ${user.userName} created`})
            })
            .catch(err=>{
                res.status(500).json({
                    status: 500,
                    reason: 'ServerError',
                    message: 'Server error'
                })
            })
        })
    })
    .catch(err=>{
        res.status(500).json({
            status: 500,
            reason: 'ServerError',
            message: 'Server error'
        })
    })
})
usersRouter.put("/", jwtAuth, (req, res)=>{
    const acceptFields = ['userName', 'password', 'scores'].filter(field=> field in req.body)
    const missingField = acceptFields.length<2
    if (missingField) {
        return res.status(422).json({
            status: 422,
            reason: 'ValidationError',
            message: 'Missing field'
        })
    }
    if('password' in req.body) {
        User.hashPassword(req.body.password)
        .then(hashedPassword=>{
            let newUser = {
                userName:req.body.userName,
                password: hashedPassword
            }
            User.findOneAndUpdate({userName: req.body.userName}, {$set: newUser})
            .then(user=>{
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
        .catch(err=>{
            res.status(500).json({
                status: 500,
                reason: 'ServerError',
                message: 'Server error'
            })
        })
    }
    else {
        User.findOneAndUpdate({userName: req.body.userName}, {$set: req.body})
        .then(user=>{
            res.status(200).end()
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
usersRouter.delete("/:userId", jwtAuth, (req, res)=>{
    Game.deleteMany({creator: req.params.userId}, function () {
        User.findByIdAndDelete(req.params.userId)
        .then(()=>{
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
    .catch(()=>{
        res.status(500).json({
            status: 500,
            reason: 'ServerErr',
            message: 'Unable to delete'
        })
    })

})

module.exports = {usersRouter}