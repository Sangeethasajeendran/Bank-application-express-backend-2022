//using express,create server

//import express
const express = require('express')

//import data service app
const dataService = require('./services/data.service')

//import cors
const cors = require('cors')

const { application, request } = require('express')

//2.create a server app  using express
const app = express()

//using cors define origin to server app
app.use(cors({
    origin: ['http://localhost:4200']
}))

// import jsonwebtoken
const jwt = require('jsonwebtoken')

//to parse json data
app.use(express.json())

//3.set port for server app
app.listen(3000, () => {
    console.log('server started at port 3000');
})

// application specific middleware
const appMiddleware = (req, res, next) => {
    console.log('this is middleware');
    next()
}
app.use(appMiddleware)

//router specific middleware - token validation
const jwtMiddleware = (req, res, next) => {
    console.log('inside router specfic middleware');
    // get token from request headers x-access-token key
    let token = req.headers['x-access-token']
    //verify token using jsonwebtoken
    try{
        let data = jwt.verify(token, 'supersecretkey123')
        req.currentAcno=data.currentAcno;
        next()
    }
    catch{
        res.status(404).json({
            status:false,
            message:"Token authentication failed...please login"
        });
    }
}

//http request - REST api
app.get('/', (req, res) => {
    res.send("GET METHOD")
})

app.post('/', (req, res) => {
    res.send("POST METHOD")
})

app.patch('/', (req, res) => {
    res.send("PATCH METHOD")
})

app.put('/', (req, res) => {
    res.send("PUT METHOD")
})

app.delete('/', (req, res) => {
    res.send("DELETE METHOD")
})

//http request - REST api -bank api

//1. Login api
app.post('/login', (req, res) => {
    console.log('inside login function');
    console.log(req.body);
    // asynchronous
    dataService.login(req.body.acno, req.body.pswd)
        .then((result) => {
            res.status(result.statusCode).json(result)
        })
    // res.send("login successfully")
})

app.post('/register', (req, res) => {
    console.log('inside register function');
    console.log(req.body);
    // asynchronous
    dataService.register(req.body.acno, req.body.pswd, req.body.uname)
        .then((result) => {
            res.status(result.statusCode).json(result)
        })
})

app.post('/deposit',jwtMiddleware, (req, res) => {
    console.log('inside deposit function');
    console.log(req.body);
    // asynchronous
    dataService.deposit(req,req.body.acno, req.body.pswd, req.body.amount)
        .then((result) => {
            res.status(result.statusCode).json(result)
        })
})
//withdraw api
app.post('/withdraw',jwtMiddleware, (req, res) => {
    console.log('inside withdraw function');
    console.log(req.body);
    // asynchronous
    dataService.withdraw(req,req.body.acno, req.body.pswd, req.body.amount)
        .then((result) => {
            res.status(result.statusCode).json(result)
        })
})

//blnc
app.post('/getBalance',jwtMiddleware, (req, res) => {
    console.log('inside getBlance function');
    console.log(req.body);
    // asynchronous
    dataService.getBalance(req.body.acno)
        .then((result) => {
            res.status(result.statusCode).json(result)
            console.log(result);
        })
})

app.post('/getTransaction',jwtMiddleware, (req, res) => {
    console.log('inside gettransaction function');
    console.log(req.body);
    // asynchronous
    dataService.getTransaction(req.body.acno)
        .then((result) => {
            res.status(result.statusCode).json(result)
            console.log(result);
        })
})

app.delete('/deleteAccount/:acno',jwtMiddleware, (req, res) => {
    console.log('inside deleteAccount function');
    // asynchronous
    dataService.deleteAccount(req.params.acno)
        .then((result) => {
            res.status(result.statusCode).json(result)
            console.log(result);
        })
})