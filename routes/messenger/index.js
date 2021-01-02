const express = require('express')
const router = express.Router()

const {
    checkAuthenticated
} = require("../../authorizers/userAuth");

var dataCamp = require('../../models/database')
dataCamp.connect()
    .then(() => dataCamp = dataCamp.get().collection('users'))
    .catch(e => console.log(e))

router.get('/', checkAuthenticated, (req, res) => {
    res.render('messenger/index.ejs', {
        user: req.user,
        isChatOpen: false
    })
})

router.get('/:room', checkAuthenticated, async (req, res) => {
    await dataCamp.findOne({
        id: req.user.id,
        chat_rooms: {
            $elemMatch: {
                id: req.params.room
            }
        }
    }, {
        projection: {
            _id: 0,
            'chat_rooms.$': 1
        }
    }, (err, rooms) => {
        if (err) console.log(err)

        res.render('messenger/index.ejs', {
            user: req.user,
            isChatOpen: true,
            rooms
        })
    })
})

module.exports = router