const express = require("express");
const router = express.Router()

const {
    checkAuthenticated
} = require("../../authorizers/userAuth");

const bcrypt = require("bcrypt")
const users = require("../../models/users")()

var dataCamp = require('../../models/database')
dataCamp.connect()
    .then(() => dataCamp = dataCamp.get().collection('users'))
    .catch(e => console.log(e))

router.get('/', checkAuthenticated, (req, res) => {
    res.render('settings/index.ejs', {
        user: req.user
    })
})

router.get('/account', checkAuthenticated, (req, res) => {
    res.render('settings/account.ejs', {
        user: req.user
    })
})


router.get('/password', checkAuthenticated, (req, res) => {
    res.render('settings/password.ejs', { user: req.user })
})

router.post('/password', checkAuthenticated, async (req, res) => {
    const user = await users.find(req.user.email)

    if (user == null) {
        return res.render('settings/password.ejs', {
            message: 'No user found',
            user: req.user
        })
    }

    try {

        if (await bcrypt.compare(req.body.cpass, user.password)) {
            delete user.password;

            const newHashedPass = await bcrypt.hash(req.body.npass, 10)

            await dataCamp.updateOne({
                id: req.user.id
            }, {
                $set: {
                    password: newHashedPass
                }
            }, (err, resp) => {
                if (err) res.sendStatus(500)
                req.logOut()
                res.redirect('/accounts')
            })

        } else {

            return res.render('settings/password.ejs', {
                message: 'Incorrect password',
                user: req.user
            })

        }

    } catch (e) {
        res.sendStatus(500)
    }
})

router.get('/deactivate', checkAuthenticated, (req, res) => {
    res.render('settings/deactivate.ejs', { user:req.user })
})

router.post('/deactivate', checkAuthenticated, async (req, res) => {
    await dataCamp.updateOne({ id: req.user.id }, { $set: { accStatus: "DEACTIVATED" } }, (err, resp) => {
        if(err) res.sendStatus(500)
        req.logOut()
        res.redirect('/accounts')
    })
})

module.exports = router