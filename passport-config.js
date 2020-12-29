const bcrypt = require("bcrypt")
const localStrategy = require('passport-local').Strategy
const users = require("./models/users")()

module.exports = (passport) => {
    const authenticateUser = async (email, password, done) => {
        const user = await users.find(email)

        if (user == null) {
            return done(null, false, {
                message: 'No user found with that email'
            })
        }

        try {

            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {

                return done(null, false, {
                    message: 'Incorrect password'
                })
            }

        } catch (e) {
            return done(e)
        }
    }


    passport.use(new localStrategy({
        usernameField: 'email',
        passwordField: 'pass',
    }, authenticateUser))

    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser(async (id, done) => {
        return done(null, await users.byId(id))
    })
}