 var app = angular.module('appRoutes' , ['ngRoute'])
       .config(function($routeProvider , $locationProvider) {
         $locationProvider.hashPrefix('');
           $routeProvider
           .when('/', {
             templateUrl: 'app/views/pages/home.html'
           })

           .when('/login', {
             templateUrl: 'app/views/pages/users/login.html' ,
             authenticated: false
           })

           .when('/register', {
             templateUrl: 'app/views/pages/users/register.html',
             controller : 'regCtrl' ,
             controllerAs : 'register' ,
             authenticated: false
           })




           .when('/profile' , {
             templateUrl: 'app/views/pages/users/profile.html' ,
             authenticated: true
           })


           .when('/logout' , {
             templateUrl: 'app/views/pages/users/logout.html',
             authenticated: true
           })


           .when('/activate/:token' , {
             templateUrl: 'app/views/pages/users/activation/activate.html' ,
             controller : 'emailCtrl' ,
             controllerAs : 'email',
              authenticated: false
           })

           .when('/resetusername' , {
             templateUrl: 'app/views/pages/users/reset/resetUsername.html' ,
             controller: 'usernameCtrl',
             controllerAs : 'username',
              authenticated: false

           })
           .when('/management' , {
             templateUrl: 'app/views/pages/management/management.html' ,
             controller: 'managementCtrl' ,
             controllerAs: 'management' ,
             authenticated: true ,
             permission: ['admin' , 'moderator']
           })

           .when('/edit/:id' , {
             templateUrl: 'app/views/pages/management/edit.html' ,
             controller: 'editCtrl' ,
             controllerAs: 'edit' ,
             authenticated: true ,
             permission: ['admin' , 'moderator']
           })

           .otherwise({redirectTo : '/'});

           $locationProvider.html5Mode({
             enabled : true ,
             requireBase : false
           });

       });


app.run(['$rootScope' , 'auth' ,'$location' ,'User', function($rootScope , auth , $location , User) {
  $rootScope.$on('$routeChangeStart' , function(event , next , current) {

    if(next.$$route !== undefined){

      if(next.$$route.authenticated == true){
        if(!auth.isLoggedIn()){
        event.preventDefault();
        $location.path('/');
      }else if(next.$$route.authenticated === true){
          User.getPermission().then(function(data) {
            console.log(data);
            if(next.$$route.permission[0] !== data.data.permission){
              if(next.$$route.permission[1] !== data.data.permission){
                event.preventDefault();
                $location.path('/');
              }
            }
          });
      }
      }else if(next.$$route.authenticated == false){
          if(auth.isLoggedIn()){
          event.preventDefault();
          $location.path('/profile');
        }

      }

    }


  });
}]);
