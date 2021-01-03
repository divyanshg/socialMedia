const express = require('express')
const router = express.Router()
const {
    checkAuthenticated
} = require("../../../authorizers/userAuth");

const notifications = require('../../../utils/notification')
const users = require('../../../models/users')()

const { v4: uuidv4 } = require('uuid');

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
    }, {
        $addToSet: {
            followers: follower
        }
    })

    const addFollowing = await dataCamp.updateOne({
        id: req.user.id
    }, {
        $addToSet: {
            following: following
        }
    })

    const notify = notifications.createNew(req.params.userid, {
        msg: `${req.user.username} started following you.`
    }, dataCamp)

    Promise.all([addFollower, addFollowing, notify])
        .then(results => {
            res.sendStatus(200)
        });
})

router.post('/unfollow/:userid', checkAuthenticated, async (req, res) => {
    const removeFollower = await dataCamp.updateOne({
        id: req.params.userid
    }, {
        $pull: {
            "followers": {
                id: req.user.id
            }
        }
    })

    const removeFollowing = await dataCamp.updateOne({
        id: req.user.id
    }, {
        $pull: {
            "following": {
                id: req.params.userid
            }
        }
    })

    Promise.all([removeFollower, removeFollowing])
        .then(results => {
            res.sendStatus(200)
        });
})

router.post('/like/:postId/:uid', checkAuthenticated, async (req, res) => {
    const like = {
        id: req.user.id,
        username: req.user.username
    }

    const addLike = await dataCamp.updateOne({
        username: req.params.uid,
        posts: {
            $elemMatch: {
                _id: req.params.postId
            }
        }
    }, {
        $addToSet: {
            "posts.$.likes": like
        }
    })

    const notify = notifications.createNew(req.params.uid, {
        msg: `${req.user.username} liked your post.`
    }, dataCamp)

    Promise.all([addLike, notify])
        .then(results => {
            res.sendStatus(200)
        });
})

router.post('/removelike/:postId/:uid', checkAuthenticated, async (req, res) => {
    const removeLike = await dataCamp.updateOne({
        username: req.params.uid,
        posts: {
            $elemMatch: {
                _id: req.params.postId
            }
        }
    }, {
        $pull: {
            "posts.$.likes": {
                id: req.user.id
            }
        }
    })

    Promise.all([removeLike])
        .then(results => {
            res.sendStatus(200)
        });
})

router.post('/new_profile_picture', checkAuthenticated, async (req, res) => {
    var pp = req.files.pp
    await pp.mv(`./public/profile_pictures/${req.user.id}.png`, async (err, result) => {
        if (err) throw err
        await dataCamp.updateOne({id:req.user.id}, { $set: { profile_pic: `/s/profile_pictures/${req.user.id}.png` } })
        return res.redirect('/u/' + req.user.username)
    })
})

router.get("/search", function (req, res, next) {
    var regx = "^" + req.query.q + ".*";
    if (req.query.q == '') return res.send();
    users.findByQuery({
        $or: [{
                username: {
                    $regex: regx,
                    $options: 'i'
                }
            },
            {
                firstname: {
                    $regex: regx,
                    $options: 'i'
                }
            },
            {
                lastname: {
                    $regex: regx,
                    $options: 'i'
                }
            }
        ]
    }).then(all => {
        var users = []
        all.forEach(user => {
            if (user.accStatus != "DEACTIVATED") {
                users.push(user)
            }
        })
        return res.send(users);
    });
});

router.post('/comment/:postId/:author', checkAuthenticated, async (req, res) => {
    const comment = {
        text: req.query.txt,
        by: `${req.user.firstname} ${req.user.lastname}`,
        username: req.user.username,
        usrId: req.user.id
    }

    const addComment = await dataCamp.updateOne({
        username: req.params.author,
        posts: {
            $elemMatch: {
                _id: req.params.postId
            }
        }
    }, {
        $addToSet: {
            "posts.$.comments": comment
        }
    })

    const notify = notifications.createNew(req.params.author, {
        msg: `${req.user.username} commented on your post.`
    }, dataCamp)

    Promise.all([addComment, notify])
        .then(results => {
            res.sendStatus(200)
        });

})

router.get('/notifications', checkAuthenticated, async (req, res) => {
    res.render('notifications/index.ejs', {
        notifications: req.user.notifications,
        user: req.user
    })
    await dataCamp.updateOne({
        id: req.user.id
    }, {
        $set: {
            notifications: []
        }
    })
})

router.post('/updateProfile', checkAuthenticated, async (req, res) => {
    var bdy = req.body
    var key = Object.keys(bdy)[0]

    var query = {}

    query[key] = bdy[key]

    await dataCamp.updateOne({
        id: req.user.id
    }, {
        $set: query
    }, (err, result) => {
        if (err) res.sendStatus(500)
        res.redirect('/settings/account')
    })
})

router.post('/new_room/:withid/:uname', checkAuthenticated, async (req, res) => {
    var user = await users.find(req.params.uname)
    const roomId = uuidv4()
    const croom = {
        recv: {
            username: req.params.uname,
            uid: req.params.withid,
            name: `${user.firstname} ${user.lastname}`
        },
        id: roomId,
        messages: []
    }

    const uroom = {
        recv: {
            username: req.user.username,
            uid: req.user.id,
            name: `${req.user.firstname} ${req.user.lastname}`
        },
        id: roomId,
        messages: []
    }

    const pr1=dataCamp.updateOne({ id:req.user.id }, { $addToSet: { chat_rooms: croom } })
    const pr2=dataCamp.updateOne({ id: req.params.withid }, { $addToSet: { chat_rooms: uroom } })

    Promise.all([pr1, pr2])

    res.redirect('/messenger/'+roomId)
})

module.exports = router