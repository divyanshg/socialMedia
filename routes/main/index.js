const express = require("express");
const router = express.Router()
const ta = require("time-ago")

const {
    checkAuthenticated
} = require("../../authorizers/userAuth");

const user = require("../../models/users")();

var dataCamp = require('../../models/database')
dataCamp.connect()
    .then(() => dataCamp = dataCamp.get().collection('users'))
    .catch(e => console.log(e))

router.get('/', checkAuthenticated, async (req, res) => {

    await user.getAll()
        .then(users => {

            var posts = [];
            for (var i = 0; i < users.length; i++) {
                if (users[i].id == req.user.id) {
                    for (var j = 0; j < users[i].posts.length; j++) {
                        users[i].posts[j].timeago = ta.ago(users[i].posts[j].createdAt);
                        posts.push(users[i].posts[j]);
                    }
                } else if (req.user.following.find(u => u.id == users[i].id)) {
                    for (var j = 0; j < users[i].posts.length; j++) {
                        users[i].posts[j].timeago = ta.ago(users[i].posts[j].createdAt);
                        posts.push(users[i].posts[j]);
                    }
                }
            }
            res.render('home/index.ejs', {
                user: req.user,
                people: users,
                posts: posts.reverse()
            })
        })
        .catch(e => {
            return e
        })
})

router.get('/u/:username', checkAuthenticated, async (req, res) => {
    if (req.params.username == req.user.username) {
        res.render('home/profile.ejs', {
            user: req.user,
            profileuser: req.user,
            posts: req.user.posts.reverse()
        })
    } else {
        await user.find(req.params.username)
            .then(user => {
                delete user.password;
                res.render('home/profile.ejs', {
                    user: req.user,
                    profileuser: user,
                    posts: user.posts.reverse()
                })
            })
    }
})

router.get('/post/:id/', checkAuthenticated, async (req, res) => {
    await dataCamp.findOne({
        posts: {
            $elemMatch: {
                _id: req.params.id
            }
        }
    }, (err, user) => {
        if (err) res.sendStatus(500)

        var post = user.posts.find(post => post._id == req.params.id)

        res.render('home/post.ejs', {
            user: req.user,
            post
        })
    })

})

router.post('/post', checkAuthenticated, async (req, res) => {
    var isImage = false;

    if (req.files != null) {
        isImage = true
        var file = req.files.photo
        await file.mv('./public/feeds/' + req.user.id + "_" + file.name, (err, result) => {
            if (err) throw err
            return
        })
    }

    await user.savePost(req, isImage)
        .then(results => {
            res.redirect('/')
        })
})


module.exports = router