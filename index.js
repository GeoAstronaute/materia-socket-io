const defaultCode = `module.exports = function(io) {
    io.on('connection', (socket) => {
        //TODO
        // example :  socket.on('disconnect', () => { console.log("a user disconnect")})
    })
}`

const requireWithoutCache = (name) => {
    let p = require.resolve(name)
    if (require.cache[p]) {
        delete require.cache[p]
    }
    return require(name)
}

class SocketIo {
    constructor(app, config) {
        this.app = app
        this.io = require('socket.io')(this.app.server.server)
        this.config = config
        this.userCount = 0
    }
    getModule() { return "web/js/main.js" }
    getTemplate() { return "web/index.html" }

    start() {
        const path = require('path')
        let p = path.join(this.app.path, 'server', 'socketio')

        try {
            let script = requireWithoutCache(p)
            this.watchUsers()
            script(this.io)
        } catch (e) {
            return this.app.saveFile(`${p}.js`, defaultCode, { mkdir: true })
                .then(() => this.start())
        }
    }

    watchUsers() {
        this.io.on('connection', (socket) => {
            this.userCount++
            this.io.emit('user-connected', this.userCount)
            socket.on('disconnect', () => {
                this.userCount--
                this.io.emit('user-disconnected', this.userCount)
            })
            socket.on('local connect', () => {
                this.io.emit('rectify', this.userCount)
            })
        })
    }
    uninstall(app) {}
}

module.exports = SocketIo