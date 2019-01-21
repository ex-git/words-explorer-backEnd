'use strict'

// hash password
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    userName: {type: String, required:true},
    password: {type: String, required:true}
})

UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10)
}

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password)
}

const questionSchema = mongoose.Schema({
    word: {type: String,  required:true},
    question: {type: Array, required:true},
    correctAnswer: {type: String, required:true}
})

const gameSchema = mongoose.Schema({
    creator: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    gameStatus: {type: String, default: 'open'},
    gameId: {type: String, required:true, default: Date.now().toString()},
    questions: [questionSchema],
    currentQuestion:{type: Number, default: 0},
    timeOutUser:{type: Number, default: 0},
    answersReceived: {},
    players: {},
})

gameSchema.pre("find", function(next) {
    this.populate("creator");
    next()
})

gameSchema.pre("findOne", function(next) {
    this.populate("creator");
    next()
})


const Game = mongoose.model("Game", gameSchema);
const User = mongoose.model("User", UserSchema)

module.exports = {Game, User};