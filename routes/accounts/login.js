const passport = require('passport')

module.exports = {
    get: (req, res) => {
        res.render('./accounts/login.ejs')
    }
}