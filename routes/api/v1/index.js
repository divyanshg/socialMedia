const express = require('express')
const router = express.Router()
const {
    checkAuthenticated
} = require("../../../authorizers/userAuth");

const notifications = require('../../../utils/notification')

var dataCamp = require('../../../models/database')
dataCamp.connect()
    .then(() => dataCamp = dataCamp.get().collection('users'))
    .catch(e => console.log(e))

router.post('/follow/:userid/:username', checkAuthenticated, async (req, res) => {
    const following = {
        id: req.params.userid,
        name: req.params.username
    }

    const follower = {
        id: req.user.id,
        name: req.user.username
    }

    const addFollower = await dataCamp.updateOne({
        id: req.params.userid
    }, { $addToSet: { followers: follower } })

    const addFollowing = await dataCamp.updateOne({
        id: req.user.id
    }, { $addToSet: { following: following } })

    const notify = notifications.createNew(req.params.userid, `${req.user.username} started following you.`, dataCamp)

    Promise.all([addFollower, addFollowing, notify])
        .then(results => {
            //console.log(results)
        });
})

module.exports = router