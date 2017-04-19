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
        setInterval(() => {
            if (!$scope.$$phase) {
                $scope.$apply(() => {
                    $scope.user = $rootScope.app.io.userCount
                })
            }
        }, 1000)
    }

    function init() {
        $scope.user = $rootScope.app.io.userCount
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
                $scope.watchUsers()
            })
        });
    }

    init()
})

module.exports = socketIo