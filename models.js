'use strict'

// hash password
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    userName: {type: String, required:true},
    password: {type: String, required:true},
    scores: {type: String, default: 0},
})

UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10)
}

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password)
}

const questionSchema = mongoose.Schema({
    correctAnswer: {type: String,  required:true},
    question: {type: String, required:true}
})


const gameSchema = mongoose.Schema({
    creator: {type: String, required: true},
    gameStatus: {type: String, default: 'open'},
    gameId: {type: String, required:true, default: new Date().getTime().toString()},
    questions: [questionSchema],
    answersReceived: {type: 'mixed', default: {}},
    players: {type: Array, default: []},
}, { minimize: false })

// gameSchema.pre("find", function(next) {
//     this.populate("creator");
//     next()
// })

// gameSchema.pre("findOne", function(next) {
//     this.populate("creator");
//     next()
// })


const Game = mongoose.model("Game", gameSchema);
const User = mongoose.model("User", UserSchema)

module.exports = {Game, User};