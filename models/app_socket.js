const userss = require('./users')()

module.exports = (io) => {
    var dataCamp = require('./database')
    dataCamp.connect()
        .then(() => dataCamp = dataCamp.get().collection('users'))
        .catch(e => console.log(e))
    io.on('connection', (socket) => {
        socket.on('join', (room) => {
            socket.join(room)
        })
        socket.on('msg', async (room, recv, msg) => {
            await checkIfRoomExist(room, recv, msg.sender, dataCamp)
                .then(r => {
                    var sm1 = dataCamp.updateOne({
                        username: msg.sender,
                        chat_rooms: {
                            $elemMatch: {
                                id: room
                            }
                        }
                    }, {
                        $addToSet: {
                            "chat_rooms.$.messages": msg
                        }
                    })

                    var sm2 = dataCamp.updateOne({
                        username: recv,
                        chat_rooms: {
                            $elemMatch: {
                                id: room
                            }
                        }
                    }, {
                        $addToSet: {
                            "chat_rooms.$.messages": msg
                        }
                    })

                    Promise.all([sm1, sm2])
                        .then(results => {

                            io.to(room).emit('msg', msg)
                        })
                })
        })
    })
}

function checkIfRoomExist(room, recv, sender, dataCamp) {
    return new Promise(async (resolve, reject) => {
        const checkForSender = dataCamp.findOne({
            username: sender,
            chat_rooms: {
                $elemMatch: {
                    id: room
                }
            }
        }, (e, croom) => {
            if (e) return reject(e)
            if (croom == null) createRoom(sender, room, recv)
        })
        const checkForReciever = dataCamp.findOne({
            username: recv,
            chat_rooms: {
                $elemMatch: {
                    id: room
                }
            }
        }, (e, croom) => {
            if (e) return reject(e)
            if (croom == null) createRoom(recv, room, sender)
        })

        const createRoom = async (username, room, recv) => {
            const reciever = await userss.find(recv)
            const recvi = {
                username: recv,
                name: `${reciever.firstname} ${reciever.lastname}`,
                uid: reciever.id
            }
            const croom = {
                recv: recvi,
                id: room,
                messages: []
            }

            await dataCamp.updateOne({ username }, { $addToSet: { chat_rooms: croom } })
        }

        Promise.all([checkForReciever, checkForSender])
        .then(results => {
            resolve("OK")
        })
    })
}