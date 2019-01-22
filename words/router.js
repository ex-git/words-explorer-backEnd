'use strict'

const express = require('express')
const {API_KEY, ENDPOINT} = require('./config')
const wordsRouter = express.Router();

//use axios to get external API response
const axios = require('axios');

// // const passport = require('passport')
// const {Customer, Invoice} = require('../models')
// const jwtAuth = passport.authenticate('jwt', {session: false});

//body parser
// invoiceRouter.use(express.json())

// words.get("/", jwtAuth, (req, res)=>{

const structureResponse = data =>{
    if (data.length === 0) {
        return {message: 'Nothing found with this word',
        result : 0}
    }
    else if(data.length >0 && typeof(data[0]) === "object") {
        return {word: data[0].meta.id.split(':')[0],
            results: data.filter(subData=>subData.meta.id.split(':')[0].toLowerCase()===data[0].meta.id.split(':')[0].toLowerCase()).map(speech=>{
            let definitionAndExamples = speech.def[0].sseq.filter(eachDefinition=>{
                if (eachDefinition[0][1].dt.length>1 && eachDefinition[0][1].dt[0][1].replace(/{(.*?)}/g, '').trim() !== '') {
                    if (/^[a-zA-Z]/.test(eachDefinition[0][1].dt[0][1].replace(/{(.*?)}/g, '').trim())) {
                        return true
                    }
                    return false
                }
                return false
            }).map(eachDef=>{
                if (eachDef[0][1].dt.length>1 && eachDef[0][1].dt[0][1].replace(/{(.*?)}/g, '') !== ' ') {
                    return {def: eachDef[0][1].dt[0][1].replace(/{(.*?)}/g, '').trim(),
                            example: eachDef[0][1].dt[1][1][0].t.replace(/{(.*?)}/g, '')
                    }
                }
            })
            return {
                partsOfSpeech: speech.fl,
                definitions: definitionAndExamples
            }
        })}
    }
    else if (data.length >0 && typeof(data[0]) === "string") {
        return {similarWords: data}
    }
}
wordsRouter.get("/:id", (req, res)=>{
    const query = `${ENDPOINT}${req.params.id}?key=${API_KEY}`
    axios(query)
    .then(response=>{
        return res.status(200).send(structureResponse(response.data))
    })
    .catch(
        ()=>
        res.status(500).json({
            status: 500,
            reason: 'ServerError',
            message: 'Server Error'}) 
    )
})

module.exports = {wordsRouter}