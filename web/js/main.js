var fs = require('fs')
var path = require('path')

let socketIo = angular.module('socket-io', [
    'ngResource',
    'ngSanitize',
    'ngMessages',
    'ngAnimate'
]).controller('SocketIoController', ($scope, $rootScope, AddonsService, QueryService, AppService) => {
    $scope.defaultPath = path.join($rootScope.app.path, 'node_modules', '@materia', 'socket-io', 'web', 'js', 'config.js')
    $scope.path = path.join($rootScope.app.path, 'server', 'socketio.js')

    $scope.AddonsService = AddonsService
    $scope.AppService = AppService

    $scope.save = (data) => {
        $rootScope.app.saveFile($scope.path, data, { mkdir: true }).then(() => {
            $scope.AppService.reloadAll({ syncOnlyDatabase: true })
        });
    }
    $scope.watchUsers = () => {
        var socket = require($rootScope.app.path + '/node_modules/@materia/socket-io/node_modules/socket.io-client/dist/socket.io')('http://localhost:8080');
        socket.on('user-connected', (data) => {
            $scope.$apply(() => {
                $scope.user = data - 1
            })
        });
        socket.on('user-disconnected', (data) => {
            $scope.$apply(() => {
                $scope.user = data - 1
            })
        });
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