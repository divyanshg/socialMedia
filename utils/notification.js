module.exports = {
    createNew: async (id, body, dataCamp) => {
        await dataCamp.updateOne({
            $or: [{
                id
            }, {
                username: id
            }]
        }, {
            $addToSet: {
                notifications: body
            }
        })
    }
}