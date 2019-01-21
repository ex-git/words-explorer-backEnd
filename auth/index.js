'use strict'

const {authRouter} = require('./router');
const {localStrategy, jwtStrategy} = require('./passport')

module.exports = {authRouter, localStrategy, jwtStrategy};