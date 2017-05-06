class SocketIo {
    constructor(app, config) {
        this.app = app
        this.io = require('socket.io')(this.app.server.server)
        this.config = config
        this.userCount = 0
        this.localConnection = 0
    }
    getModule() { return "web/js/main.js" }
    getTemplate() { return "web/index.html" }

    start() {
        var path = require('path')
        var defaultPath = path.join(this.app.path, 'node_modules', '@materia', 'socket-io', 'web', 'js', 'config.js')
        let p = path.join(this.app.path, 'server', 'socketio')
        try {
            require(p)
            let socketioPath = require.resolve(p)
            if (require.cache[socketioPath]) {
                delete require.cache[socketioPath]
            }
            var path = p
        } catch (e) {
            path = defaultPath
        }
        let config = require(path)
        this.watchUsers()
        config(this.io)
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
                this.localConnection++
                    this.io.emit('rectify', this.userCount, this.localConnection)
            })
            socket.on('local disconnect', () => {
                this.localConnecton = 0
            })
        })
    }
    uninstall(app) {}
}

module.exports = SocketIo