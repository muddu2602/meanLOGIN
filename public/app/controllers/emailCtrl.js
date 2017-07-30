angular.module('emailController' , ['userServices'])
        .controller('emailCtrl' , function($routeParams ,$location , $timeout ,  User) {
         var app = this;
         app.yes = false;
         app.SuccessMsg = false;
         app.errorMsg =  false;
         this.activated = function() {
           app.yes = true;
           app.SuccessMsg = 'Account Activated';
           $timeout(function(req , res) {

               if(app.SuccessMsg){
                 app.SuccessMsg = 'Account Activated';
               }
               else{
                 app.errorMsg = 'Account Not Activated';
               }
               $location.path('/login');
           } , 2000);
         }
          User.activateaccount($routeParams.token).then(function(data) {
            console.log(data);
              var app = this;
              app.SuccessMsg = false;
              app.errorMsg =  false;
          });
        })
        .controller('usernameCtrl' , function(User) {
          app = this;
          app.errorMsg = false;
          app.loading = true;
          app.sendUsername = function(userData , valid) {
            if(valid){
              User.sendUsername(app.userData.email).then(function(data) {
                app.loading = false;
                if(data.data.success){
                  app.SuccessMsg = data.data.message;
                }
                else{
                  app.loading = false;
                  app.errorMsg = data.data.message;
                }
              });
            } else {
              app.loading = false;
              app.errorMsg = 'PLease enter a valid email ID'
            }
          }
        });
