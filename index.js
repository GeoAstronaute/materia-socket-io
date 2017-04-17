class SocketIo {
    constructor(app, config) {
        this.app = app
        this.io = require('socket.io')(this.app.server.server)
        this.config = config
    }
    getModule() { return "web/js/main.js" }
    getTemplate() { return "web/index.html" }

    start() {
        this.io.on('connection', (socket) => {
            var path = require('path')
            let p = path.join(this.app.path, 'server', 'socketio')
            try {
                require(p)
            } catch (e) {

            }
            let socketioPath = require.resolve(p)
            if (require.cache[socketioPath]) {
                delete require.cache[socketioPath]
            }
            let config = require(p)
            config(this.io, socket)
        });
    }
    uninstall(app) {}
}

module.exports = SocketIo