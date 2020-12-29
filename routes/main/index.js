const express = require("express");
const router = express.Router()
const ta = require("time-ago")

const {
    checkAuthenticated
} = require("../../authorizers/userAuth");

const users = require("../../models/users")();

router.get('/', checkAuthenticated, async (req, res) => {
    delete req.user.password;

    await users.getAll()
        .then(users => {

            var posts = [];
            for (var i = 0; i < users.length; i++) {
                for (var j = 0; j < users[i].posts.length; j++) {
                    users[i].posts[j].timeago = ta.ago(users[i].posts[j].createdAt);
                    posts.push(users[i].posts[j]);
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

module.exports = router