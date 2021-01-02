const {
    v4: uuidv4
} = require('uuid');
module.exports = () => {

    var dataCamp = require('./database')
    dataCamp.connect()
        .then(() => dataCamp = dataCamp.get().collection('users'))
        .catch(e => console.log(e))

    return {
        find: async (email) => {
            return new Promise(async (resolve, reject) => {
                await dataCamp.findOne({
                    $or: [{
                        "email": email
                    }, {
                        "username": email
                    }]
                }, (err, user) => {
                    if (err) return reject(err)
                    var reactivator;
                    if(user.accStatus == "DEACTIVATED") {
                        reactivator = dataCamp.updateOne({ id: user.id }, { $set: { accStatus: "" } })
                    }
                    Promise.all([reactivator])
                    return resolve(user)
                })

            })
        },
        byId: async (id) => {
            return new Promise(async (resolve, reject) => {
                await dataCamp.findOne({
                    id
                }, (err, user) => {
                    if (err) return reject(err)
                    return resolve(user)
                })
            })
        },
        save: (user) => {
            return new Promise(async (resolve, reject) => {
                await dataCamp.insertOne(user, (err, resp) => {
                    if (err) return reject(err)
                    resolve(resp)
                })
            })
        },
        getAll: () => {
            return new Promise(async (resolve, reject) => {
                await dataCamp.find({}, {
                    projection: {
                        _id: 0,
                        password: 0
                    }
                }).toArray((err, users) => {
                    if (err) return reject(err)
                    return resolve(users)
                })
            })
        },
        findByQuery: (query) => {
            return new Promise(async (resolve, reject) => {
                await dataCamp.find(query, { projection: { _id:0, firstname: 1, lastname: 1, username: 1, profile_pic: 1, accStatus: 1 } }).toArray((err, users) => {
                    if (err) return reject(err)
                    return resolve(users)
                })

            })
        },
        savePost: async (req, isImage) => {
            var static_url;
            if (isImage) {
                static_url = `/s/feeds/${req.user.id}_${req.files.photo.name}`
            } else {
                static_url = ''
            }
            const post = {
                _id: uuidv4(),
                author: req.user.username,
                static_url,
                caption: req.body.caption,
                comments: [],
                likes: [],
                createdAt: Date.now(),
                lastEdited: Date.now(),
                upp: req.user.profile_pic
            }
            await dataCamp.updateOne({
                id: req.user.id
            }, {
                $addToSet: {
                    posts: post
                }
            })
        }
    }
}