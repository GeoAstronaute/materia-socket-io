var fs = require('fs')
var path = require('path')

let socketIo = angular.module('socket-io', [
    'ngResource',
    'ngSanitize',
    'ngMessages',
    'ngAnimate'
]).controller('SocketIoController', ($scope, $rootScope, AddonsService, QueryService, AppService, LiveService) => {
    $scope.defaultPath = path.join($rootScope.app.path, 'node_modules', '@materia', 'socket-io', 'web', 'js', 'config.js')
    $scope.path = path.join($rootScope.app.path, 'server', 'socketio.js')

    $scope.AddonsService = AddonsService
    $scope.AppService = AppService
    let packageJsonPath = require.resolve(path.join(this.app.path, '.materia', 'server.json'))
    if (require.cache[packageJsonPath]) {
        delete require.cache[packageJsonPath]
    }
    let serverConfig = require(path.join($rootScope.app.path, '.materia', 'server.json'))

    if (serverConfig.prod && serverConfig.prod.web) {
        $scope.socketLiveUrl = 'http://' + serverConfig.prod.web.host + ':' + serverConfig.prod.web.port
    }

    $scope.socketLocalUrl = 'http://localhost:8080'

    $scope.ace = {
        theme: 'dawn',
        mode: 'javascript',
        onLoad: function(_editor) {
            _editor.$blockScrolling = Infinity
        }
    }

    $scope.save = (data) => {
        $rootScope.app.saveFile($scope.path, data, { mkdir: true }).then(() => {
            $scope.AppService.reloadAll({ syncOnlyDatabase: true })
        });
    }
    $scope.watchUsers = () => {
        $scope.user = 0
        var socket
        if (LiveService.isLive) {
            socket = require($rootScope.app.path + '/node_modules/@materia/socket-io/node_modules/socket.io-client/dist/socket.io')($scope.socketLiveUrl);
        } else {
            socket = require($rootScope.app.path + '/node_modules/@materia/socket-io/node_modules/socket.io-client/dist/socket.io')($scope.socketLocalUrl);
        }
        $scope.socket = socket

        socket.on('user-connected', (data) => {
            $scope.$apply(() => {
                $scope.user = data
            })
        });
        socket.on('user-disconnected', (data) => {
            $scope.$apply(() => {
                $scope.user = data
            })
        });
        socket.on('connect', () => {
            socket.emit('local connect')

        })
        socket.on('rectify', (data) => {
            $scope.$apply(() => {
                $scope.user = data
            })
        })
        $scope.$on("$destroy", () => {
            $scope.socket.close()
        })
    }

    function init() {
        try {
            require($scope.path)
        } catch (e) {
            fs.readFile($scope.defaultPath, "utf-8", (err, data) => {
                if (err) {
                    $scope.data = $scope.defaultPath
                }
                $scope.$apply(() => {
                    $scope.data = data
                })
            });
        }
        fs.readFile($scope.path, "utf-8", (err, data) => {
            if (err) {
                $scope.data = $scope.defaultPath
            }
            $scope.$apply(() => {
                $scope.data = data
            })
        });
        $scope.watchUsers()
    }

    init()
})
module.exports = socketIo