//import model account
const { Promise } = require('mongoose')
const db = require('./db')
// import jsonwebtoken
const jwt = require('jsonwebtoken')

//login function
const login = (acno, pswd) => {
    //check acno and pswd is present in mongo db
    //asynchrous function -Promise
    return db.Account.findOne({
        acno,
        password: pswd
    }).then((result) => {
        if (result) {
            //acno n pswd is present in db
            console.log('login successfully');
            //currentacno
            let currentAcno = acno
            //generate token
            const token = jwt.sign({
                currentAcno: acno
            }, 'supersecretkey123')

            return {
                status: true,
                message: 'login successfully',
                username: result.username,
                statusCode: 200,
                token,
                currentAcno
            }
        }
        else {
            console.log('invalid account/password');
            return {
                status: false,
                message: 'invalid account/password',
                statusCode: 404
            }
        }
    }).catch((err) => {
        console.log(err)
    })
}

//register
const register = (acno, pswd, uname) => {
    //check acno and pswd is pres ent in mongo db
    //asynchrous function -Promise
    return db.Account.findOne({
        acno
    }).then((result) => {
        if (result) {
            //acno n pswd is present in db
            console.log('Already registered');
            return {
                status: false,
                message: 'Account already exist',
                statusCode: 404
            }
        }
        else {
            console.log('register successful');
            let newAccount = new db.Account({
                acno,
                password: pswd,
                username: uname,
                balance: 0,
                transaction: []
            })
            newAccount.save()
            return {
                status: true,
                message: 'register successfully',
                username: login.uname,
                statusCode: 200
            }
        }
    }).catch((error) => {
        console.log(error);
    })
}

//deposit
const deposit = (req, acno, pswd, amount) => {
    console.log('inside deposit');
    //convert string amount to number
    let amt = Number(amount)
    //check acno and pswd is present in mongo db
    //asynchrous function -Promise
    return db.Account.findOne({
        acno,
        password: pswd
    }).then((result) => {
        if (result) {
            if (req.currentAcno != acno) {

                return {
                    status: false,
                    message: 'operation denied...Allows only own account transaction.',
                    statusCode: 404
                }

            }

            //acno n pswd is present in db
            result.balance += amt
            result.transaction.push({
                type: "CREDIT",
                amount: amt
            })
            result.save()
            return {
                status: true,
                message: `${amount} deposited successfully`,
                statusCode: 200
            }
        }
        else {
            console.log('invalid account/password');
            return {
                status: false,
                message: 'invalid account/password',
                statusCode: 404
            }
        }
    }).catch((err) => {
        console.log(err)
    })
}

const withdraw = (req, acno, pswd, amount) => {
    console.log('inside withdraw function definition');
    //convert string amount to number
    let amt = Number(amount)
    //check acno and pswd is present in mongo db
    //asynchrous function -Promise
    return db.Account.findOne({
        acno,
        password: pswd
    }).then((result) => {
        if (result) {
            if (req.currentAcno != acno) {

                return {
                    status: false,
                    message: 'operation denied...Allows only own account transaction.',
                    statusCode: 404
                }

            }

            //check sufficient balance
            if (result.balance < amt) {
                return {
                    status: false,
                    message: 'transaction failed...insufficient balance.',
                    statusCode: 404
                }
            }
            // perform withdraw
            result.balance -= amt
            result.transaction.push({
                type: "DEBIT",
                amount: amt
            })
            result.save()
            return {
                status: true,
                message: `${amount} debited successfully`,
                statusCode: 200
            }
        }
        else {
            console.log('invalid account/password');
            return {
                status: false,
                message: 'invalid account/password',
                statusCode: 404
            }
        }
    }).catch((err) => {
        console.log(err)
    })
}

const getBalance = (acno) => {
    //asynchronous function - promise
    return db.Account.findOne({
        acno
    }).then(
        (result) => {
            if (result) {
                //acno present db
                let balance = result.balance
                result.transaction.push({
                    type: "BALANCE ENQUIRY",
                    amount: 'NIL'
                })
                result.save()
                //send to client
                return {
                    status: true,
                    message: `Your Current Balance is: ${balance}`,
                    statusCode: 200
                }
            }
            else {
                //acno not present in db
                //send to client
                return {
                    status: false,
                    message: 'invalid account number',
                    statusCode: 404
                }
            }
        }
    )
}

const getTransaction = (acno) => {
    return db.Account.findOne({
        acno
    }).then(
        (result) => {
            if (result) {
                //acno present db

                //send to client
                return {
                    status: true,
                    transaction: result.transaction,
                    statusCode: 200
                }
            }
            else {
                //acno not present in db
                //send to client
                return {
                    status: false,
                    message: 'invalid account number',
                    statusCode: 404
                }
            }
        }
    )
}

//deleteaccount
const deleteAccount=(acno)=>{
    return db.Account.deleteOne({
        acno
    }).then((result)=>{
        if(result){
            //send to client
            return{
                status:true,
                statusCode:200,
                message:'Account deleted successfully'
            }
        }
        else{
             //acno not present in db
                //send to client
                return {
                    status: false,
                    message: 'invalid account number',
                    statusCode: 404
                }
        }
    })
}

//export
module.exports = {
    login,
    register,
    deposit,
    withdraw,
    getBalance,
    getTransaction,
    deleteAccount
}