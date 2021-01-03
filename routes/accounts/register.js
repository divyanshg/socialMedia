const bcrypt = require("bcrypt")
const users = require("../../models/users")()
const { v4: uuidv4 } = require('uuid');

module.exports = () => {
    return {
        get: (req, res) => {
            res.render('./accounts/register.ejs')
        },
        post: async (req, res) => {
            try {
                const hashedPass = await bcrypt.hash(req.body.password, 10)
                //Algo to save users to db
                await users.save({
                    id:uuidv4(),
                    email: req.body.email,
                    password: hashedPass,
                    firstname: req.body.fname,
                    lastname: req.body.lname,
                    followers: [],
                    posts: [],
                    chat_rooms: [],
                    notifications: [],
                    bio: `Hey there! I'm ${req.body.fname}!`,
                    profile_pic: 'https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg',
                    username: req.body.username,
                    dob: req.body.dob,
                    following: []
                })
                .then((resp) => res.redirect("accounts/login.ejs"))
                .catch((e) => res.render('accounts/login.ejs', { messages: { error: e } }))
                
            } catch {
                res.render('accounts/login.ejs', { messages: { error: "Internal Server Error - 02" } })
            }
        }
    }
}