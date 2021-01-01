const express = require("express")
const passport = require("passport")
const app = express()

const flash = require('express-flash')
const session = require('express-session')

const mainRouter = require('../routes/main/index')
const v1_apiRouter = require('../routes/api/v1')
const settingsRouter = require('../routes/settings/index')

const methodOverride = require('method-override')
var fileupload = require("express-fileupload");

//Setting up the template engine

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.use(flash())
app.use(session({
    secret: "SIMPLE_SECRET",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(fileupload());
//Importing the routes

app.use('/accounts', require('../routes/root'))
app.use('/', mainRouter)
app.use('/api/v1/', v1_apiRouter)
app.use('/settings', settingsRouter)
app.use('/s', express.static('public'))

app.listen(80, () => {
    console.log("Running")
})