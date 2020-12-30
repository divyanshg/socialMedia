module.exports = {
    createNew: async (id, body, dataCamp) => {
        await dataCamp.updateOne({
            id
        }, {
            $addToSet: {
                notifications: body
            }
        })
    }
}