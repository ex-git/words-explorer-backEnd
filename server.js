const express = require('express');
const app = express();
const cors = require('cors');
const {CLIENT_ORIGIN, PORT, DATABASE_URL} = require('./config');

//routers
const {wordsRouter} = require('./words')
const {gamesRouter} = require('./games')
const {usersRouter} = require('./users')
const {authRouter, localStrategy, jwtStrategy } = require('./auth');

//passport and strategies
const passport = require('passport');
passport.use(localStrategy);
passport.use(jwtStrategy);

//mongoose
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// using morgan for server log
// const morgan = require("morgan")
// app.use(morgan('common'))

//same as body parser
app.use(express.json());

//cors
app.use(
    cors({
        origin: CLIENT_ORIGIN,
        credentials: true
    })
);

app.use('/api/words', wordsRouter);
app.use('/api/games', gamesRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

//return 404 for non-existing pages
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Not Found' });
});


let server;

function startServer(databaseUrl=DATABASE_URL, port=PORT) {
    return new Promise((resolve, reject)=>{
        //fix deprecation warnings with useNewUrlParser: true, useFindAndModify: false
        mongoose.connect(databaseUrl, {useNewUrlParser: true, useFindAndModify: false }, anyErr=>{
            if (anyErr) {
                return reject(anyErr)
            };
            server = app
            .listen(port, ()=> {
                console.log(`App is running at ${port}`);
                resolve();
            })
            .on("error", err=>{
                mongoose.disconnect();
                reject(err);
            });
        })
    })
}

function stopServer() {
    return mongoose.disconnect()
    .then(()=>{
        return new Promise((resolve, reject)=>{
            console.log("Closing Server");
            server.close(err=>{
                if (err) {
                    return reject(err)
                }
                resolve();
            })
        })
    })
}

if (require.main === module) {
    startServer().catch(error=>console.error(error))
}

module.exports = {app, startServer, stopServer}