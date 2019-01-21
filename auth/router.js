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
    const validUser = {address: req.user.address,
        companyName: req.user.companyName}
    const authToken = createAuthToken(req.user.userName);
    res.status(200).cookie('authToken', authToken, {maxAge: 600000, httpOnly: true, sameSite: "lax"}).json({validUser: validUser})
})

const jwtAuth = passport.authenticate('jwt', {session: false});

// User exchanges a valid JWT for a new one with a later expiration
authRouter.get('/refresh', jwtAuth, (req, res) => {
    const validUser = {address: req.user.address,
        companyName: req.user.companyName}
    const authToken = createAuthToken(req.user.userName);
    //send back cookie with 10 mins life with JWT
    res.status(200).cookie('authToken', authToken, {maxAge: 600000, httpOnly: true, sameSite: "lax"}).json({validUser: validUser})
});

// seng invalid JWT for logout
authRouter.get('/logOut', jwtAuth, (req, res) => {
    //set cookie to expire immediately
    res.status(200).cookie('authToken', '', {maxAge: 0, httpOnly: true, sameSite: "lax"}).end()
})


module.exports = {authRouter};