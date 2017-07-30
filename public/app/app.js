angular.module('userApp' , ['appRoutes','userController' , 'userServices' , 'ngAnimate' , 'mainController' , 'authServices' , 'emailController' , 'managementController' ])
        .config(function($httpProvider) {
          $httpProvider.interceptors.push('AuthInterceptor');
        });
