'use strict'

const express = require('express')
const usersRouter = express.Router();


const {User} = require('../models')

// // const passport = require('passport')
// const jwtAuth = passport.authenticate('jwt', {session: false});

//body parser
// usersRouter.use(express.json())

//usersRouter.get("/", jwtAuth, (req, res)=>{

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
    let newUser = {
        userName:req.body.userName,
        password: req.body.password
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
usersRouter.put("/", (req, res)=>{
    const requredFields = ['userName', 'password']
    const missingField = requredFields.find(field=> !(field in req.body))
    if (missingField) {
        return res.status(422).json({
            status: 422,
            reason: 'ValidationError',
            message: 'Missing field'
        })
    }
    let newUser = {}
    Object.keys(req.body).forEach(field=>{
        newGame[field] = req.body.field
    })
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
usersRouter.delete("/", (req, res)=>{
    User.findOneAndRemove({userName: req.body.userName})
    .then(user=>{
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

module.exports = {usersRouter}