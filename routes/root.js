const passport = require('passport')

const initializePassport = require('../passport-config')(passport)

const express = require('express')
const router = express.Router()

const login = require('./accounts/login')
const register = require('./accounts/register')()

const { checkAuthenticated, checkNotAuthenticated } = require('../authorizers/userAuth')

router.get('/', checkNotAuthenticated, login.get)
router.post('/', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/accounts',
    failureFlash: true
}))
router.post('/register', checkNotAuthenticated, register.post)

router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/accounts')
})

module.exports = router