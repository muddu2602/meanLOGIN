angular.module('authServices' , [])

        .factory('auth' , function($http , AuthToken) {
           var authFactory = {};
           authFactory.login = function(loginData) {
             return $http.post('api/authenticate' , loginData).then(function(data) {
              AuthToken.setToken(data.data.token);
               return data;
             });
           }

           authFactory.getUser = function() {
             if(AuthToken.getToken()){
               return $http.post('/api/me');
             }else{
               $q.reject({message: 'user has no token'});
             }
           }

           authFactory.isLoggedIn = function() {
             if(AuthToken.getToken()){
               return true;
             }else{
               return false;
             }
           };

           authFactory.logout = function() {
             AuthToken.setToken();
           };
           return authFactory ;
        })

        .factory('AuthToken' , function($window) {
          var authTokenFactory = {};

          authTokenFactory.setToken = function(token) {
            if(token){
              $window.localStorage.setItem('token' , token);
            }else{
              $window.localStorage.removeItem('token');
            }

          };

          authTokenFactory.getToken = function() {
            return $window.localStorage.getItem('token');
          };
          return authTokenFactory;
        })

        .factory('AuthInterceptor' , function(AuthToken) {
          var authInterceptorFactory = {};

          authInterceptorFactory.request = function(config) {

                      var token = AuthToken.getToken();

                      if(token) config.headers['x-access-token'] = token;

                      return config;

          };

          return authInterceptorFactory;
        })
