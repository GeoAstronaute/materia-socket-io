module.exports = function(io) {
    this.io = io
    this.io.on('connection', (socket) => {
        //TODO
        // example :  socket.on('disconnect', () => { console.log("a user disconnect")})
    })
}