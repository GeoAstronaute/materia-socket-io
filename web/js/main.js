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
    this.AppService = AppService

    $scope.save = (data) => {
        $rootScope.app.saveFile($scope.path, data, { mkdir: true }).then(() => {
            this.AppService.reloadAll({ syncOnlyDatabase: true })
        });
    }

    function init() {
        try {
            require($scope.path)
            var path = $scope.path
        } catch (e) {
            path = $scope.defaultPath
        }
        fs.readFile(path, "utf-8", (err, data) => {
            if (err) {
                $scope.data = $scope.defaultPath
            }
            $scope.$apply(() => {
                $scope.data = data
            })
        });
    }

    init()
})

module.exports = socketIo