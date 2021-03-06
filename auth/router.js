'use strict'

const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken');
const authRouter = express.Router()
const {JWT_SECRET, JWT_EXPIRY} = require('../config')

//same as bodyParser
authRouter.use(express.json());

//create token using algorithm HS256
const createAuthToken = function(userName) {
    return jwt.sign({userName}, JWT_SECRET, {
        subject: userName,
        expiresIn: JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

const localAuth = passport.authenticate('local', {session: false});

// User provides a username and password to login
authRouter.post('/login', localAuth, (req, res) => {
    const validUser = req.user
    const authToken = createAuthToken(req.user.userName);
    res.status(200).json({
        validUser: validUser,
        authToken: authToken})
})

const jwtAuth = passport.authenticate('jwt', {session: false});

// User exchanges a valid JWT for a new one with a later expiration
authRouter.get('/refresh', jwtAuth, (req, res) => {
    const validUser = req.user
    const authToken = createAuthToken(req.user.userName);
    //send back cookie with 60 mins life with JWT
    res.status(200).json({
        validUser: validUser,
        authToken: authToken})
})


module.exports = {authRouter};