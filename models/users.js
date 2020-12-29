module.exports = () => {

    var dataCamp = require('./database')
    dataCamp.connect()
        .then(() => dataCamp = dataCamp.get().collection('users'))
        .catch(e => console.log(e))

    return {
        find: async (email) => {
            return new Promise(async (resolve, reject) => {
                await dataCamp.findOne({
                    email
                }, (err, user) => {
                    if (err) return reject(err)
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
                await dataCamp.find({}, { projection:{ _id:0, password: 0 } }).toArray((err, users) => {
                    if(err) return reject(err)
                    return resolve(users)
                })
            })
        }
    }
}