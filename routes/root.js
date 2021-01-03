'use strict'

require('dotenv').config()

const passport = require('passport')
const bcrypt = require("bcrypt")

const initializePassport = require('../passport-config')(passport)

const express = require('express')
const router = express.Router()

const login = require('./accounts/login')
const register = require('./accounts/register')()

const {
    checkAuthenticated,
    checkNotAuthenticated
} = require('../authorizers/userAuth')

const nodemailer = require('nodemailer');

var dataCamp = require('../models/database')
dataCamp.connect()
    .then(() => dataCamp = dataCamp.get().collection('users'))
    .catch(e => console.log(e))

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.email,
        pass: process.env.epass
    }
});


router.get('/', checkNotAuthenticated, login.get)
router.post('/', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/accounts',
    failureFlash: true
}))
router.post('/register', checkNotAuthenticated, register.post)

router.get('/password', checkNotAuthenticated, (req, res) => {
    res.render('accounts/pass.ejs')
})

router.post('/password', checkNotAuthenticated, async (req, res) => {
    await dataCamp.findOne({
        $or: [{
            email: req.body.email
        }, {
            username: req.body.email
        }]
    }, async (err, user) => {
        if (err) res.sendStatus(500)
        if (user != null) {
            await generateOTP(user.email, dataCamp)
                .then(otp => {
                    var mailOptions = {
                        from: process.env.email,
                        to: user.email,
                        subject: 'Password Reset - Babble',
                        html: `Click here to reset your password : <a href="http://localhost/accounts/password/new/${otp}/${user.id}">Reset password</a>`
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            res.sendStatus(500)
                        } else {
                            res.render('accounts/pass.ejs', {
                                messages: {
                                    error: "A password reset link will be sent to your email address"
                                }
                            })
                        }
                    });
                })
                .catch(e => {
                    res.sendStatus(500)
                })
        } else {
            res.render('accounts/pass.ejs', {
                messages: {
                    error: "No user was found with that email"
                }
            })
        }
    })
})

router.get('/password/new/:OTP/:id', checkNotAuthenticated, async (req, res) => {
    await dataCamp.findOne({ id: req.params.id }, { projection: { _id: 0, OTP: 1 } }, (err, u) => {
        if(u != null){
            if(u.OTP == req.params.OTP){
                res.render("accounts/newPass.ejs", { id: req.params.id })
            }else{
                res.sendStatus(404)
            }
        }else{
            res.sendStatus(404)
        }
    })
})

router.post('/password/new/', checkNotAuthenticated, async (req, res) => {
    const hashedPass = await bcrypt.hash(req.body.pass, 10)
    await dataCamp.updateOne({ id:req.body.id }, { $set: { OTP:'', password: hashedPass } }, (err, resp) => {
        if(err) res.sendStatus(500)
        res.redirect('/accounts')
    })
})

router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/accounts')
})

function generateOTP(email, dataCamp) {
    return new Promise(async (resolve, reject) => {
        // Declare a digits variable  
        // which stores all digits 
        var digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < 4; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }

        await dataCamp.updateOne({
            email
        }, {
            $set: {
                OTP: OTP
            }
        }, (err, resp) => {
            if (err) reject(err)
            resolve(OTP)
        })
    })
}

module.exports = router