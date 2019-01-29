//passport

//same as === const { Strategy: LocalStrategy } = require('passport-local');
const LocalStrategy = require("passport-local").Strategy;

const { Strategy: JWTStrategy} = require('passport-jwt');

const {JWT_SECRET} = require('../config')
const {User} = require("../models");

const localStrategy = new LocalStrategy({
    //added usernameField and passwordField since localStrategy only look for username and password in lowercase in default
    usernameField: 'userName',
    passwordField: 'password'
    }, (username, password, callback)=>{
    let validUser;
    User.findOne({"userName": username})
    .then(user=>{
        if (!user) {
            return Promise.reject({
                reason: 'LoginError',
                message: 'Incorrect username or password'
            })
        }
        validUser = user;
        return user.validatePassword(password)
    })
    .then(valid=>{
        if(!valid) {
            return Promise.reject({
                reason: 'LoginError',
                message: 'Incorrect username or password'
            })
        }
        return callback(null, validUser)
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return callback(null, false, err);
      }
      return callback(err, false);
    });
});


//Extra JWT from cookie
const cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies) 
        {
            token = req.cookies.authToken
        }
    return token;
};

const jwtStrategy = new JWTStrategy({
    secretOrKey: JWT_SECRET,
    // Look for the authToken from cookie
    jwtFromRequest: cookieExtractor,
    // HS256 tokens - same as the one we issue
    algorithms: ['HS256']
    },
    (jwtPayload, callback) => {
        //check if jwt expired
        if (jwtPayload.expires > Date.now()) {
            return callback('jwt expired');
          }
        //return user name without password
        User.findOne({"userName": jwtPayload.userName}, {password: 0})
        .then(user=>{
            callback(null, user);
        })
    }
);

module.exports = { localStrategy, jwtStrategy };