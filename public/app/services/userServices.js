angular.module('userServices' , [])
        .factory('User' , function($http) {
          userFactory = {};

          userFactory.finalize = function() {
          }

           userFactory.create = function(regData) {
             return $http.post('api/users' , regData)
           }

           userFactory.checkusername = function(regData) {
             return $http.post('api/checkusername' , regData)
           }

           userFactory.checkemail = function(regData) {
             return $http.post('api/checkemail' , regData)
           }

           userFactory.activateaccount = function(token) {
             return $http.put('api/activate/' + token);
           }

           userFactory.sendUsername = function(userData) {
             return $http.get('/api/resetusername/' + userData)
           }

           userFactory.renewSession = function(username) {
             return $http.get('/api/renewToken/' + username)
           }

           userFactory.getPermission = function() {
              return $http.get('/api/permission/');
           }
           userFactory.getUsers = function() {
              return $http.get('/api/management/');
           }
           userFactory.deleteUser = function(username) {
              return $http.delete('/api/management/' + username);
           }
           userFactory.getUser = function(id) {
              return $http.get('/api/edit/' + id);
           }
           userFactory.editUser = function(id) {
              return $http.put('/api/edit/' , id);
           }


           return userFactory ;
        });
