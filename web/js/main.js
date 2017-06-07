let socketIoModule = angular.module('socket-io', [
    'ngResource',
    'ngSanitize',
    'ngMessages',
    'ngAnimate'
]).controller('SocketIoController', ($scope, $rootScope, AddonsService, QueryService, AppService, LiveService) => {
    const fs = require('fs')
    const path = require('path')

    let appRequire = require('./scripts/fix/materia-addon-require')(path.join($rootScope.app.path, 'web', 'js'))
    const Socketio = appRequire('socket.io-client/dist/socket.io')

    $scope.path = path.join($rootScope.app.path, 'server', 'socketio.js')

    $scope.AddonsService = AddonsService
    $scope.AppService = AppService
 
    let webConfig = $rootScope.app.config.get('prod', 'web')
    if (webConfig) {
        $scope.socketLiveUrl = `http://${webConfig.host}:${webConfig.port}`
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
        return $rootScope.app.saveFile($scope.path, data, { mkdir: true })
            .then(() => $scope.AppService.reloadAll({ syncOnlyDatabase: true }))
    }
    $scope.watchUsers = () => {
        $scope.user = 0
        let socketUrl = $scope.socketLocalUrl
        if (LiveService.isLive) {
            socketUrl = $scope.socketLiveUrl
        }
        $scope.socket = Socketio(socketUrl)

        $scope.socket.on('user-connected', (data) => {
            $scope.$apply(() => {
                $scope.user = data
            })
        });
        $scope.socket.on('user-disconnected', (data) => {
            $scope.$apply(() => {
                $scope.user = data
            })
        });
        $scope.socket.on('connect', () => {
            $scope.socket.emit('local connect')
        })
        $scope.socket.on('rectify', (data) => {
            $scope.$apply(() => {
                $scope.user = data
            })
        })
        $scope.$on("$destroy", () => {
            $scope.socket.close()
        })
    }

    function init() {
        //require($scope.path)
        fs.readFile($scope.path, "utf-8", (err, data) => {
            if (err) {
                return $scope.data = defaultCode
            }
            $scope.$apply(() => {
                $scope.data = data
            })
        });
        $scope.watchUsers()
    }

    init()
})
module.exports = socketIoModule