'use strict'

require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const { default: helmet } = require('helmet')
const compression = require('compression')
const app = express()

//init middlewares
app.use(morgan("dev"))
app.use(helmet())   
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//init db
require('./dbs/init.mongodb')
// const { checkOverload } = require ('./helpers/check.connect')
// checkOverload()

//init routes
const accessRouter = require('./routes/access')
const shopRouter = require('./routes/shop')

app.use('/v1/api', shopRouter)
app.use('/v1/api', accessRouter)

//handle error

app.use((req, res, next) =>{ //middleware chi co 3 tham so, ham quan ly loi thi co 4 tham so
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) =>{ 
    const status = error.status || 500
    return res.status(status).json({
        status: 'error',
        code: status,
        message: error.message || 'Internal Server Error'
    })
})
// app.set('x-powered-by', false);  

module.exports = app