angular.module('userController' , ['userServices'])
      .controller('regCtrl' , function($http  , $location , $timeout , User) {
        var app = this;
          this.userSubmit = function(regData , valid) {

            if(valid){
              app.loading = true;
              app.errorMsg = false;
              console.log('user submittted the form');
              User.create(app.regData).then(function(data) {
                console.log(data.data.success);
                console.log(data.data.message);
                if(data.data.success){
                  //console successs message
                  //user is created
                  app.loading = false;
                  app.SuccessMsg = data.data.message + '....Redirecting ...';
                  $timeout(function() {
                      $location.path('/');
                  } , 2000);
                }else{
                  //show error
                  app.loading = false;
                  app.errorMsg = data.data.message;
                }
              });
            }else{

              //show error
              app.loading = false;
              app.errorMsg = 'Please ensure the From is Filled Properly';

            }

          };
          this.checkusername = function(regData) {
            app.checkingUsername = true;
            app.usernameMsg = false;
            app.usernameInvalid = false;
            User.checkusername(regData).then(function(data) {
              console.log(data);
              if(data.data.success){
                app.checkingUsername  = false;

                app.usernameMsg = data.data.message;
                app.usernameInvalid = false;
              }else{
                app.checkingUsername = true;
                app.usernameInvalid = true;
                app.usernameMsg = data.data.message;
              }
            });

          }
          this.checkemail = function(regData) {
            app.checkingEmail = true;

            app.emailmsg = false;
            app.emailInvalid = false;
            User.checkemail(regData).then(function(data) {
              if(data.data.success){
                app.checkingEmail  = false;
                app.emailmsg = data.data.message;
                app.emailInvalid = false;
              }else{
                app.checkingEmail = false;
                app.emailInvalid = true;
                app.emailmsg = data.data.message;
              }
            });

          }

       })

     .directive('match', function() {
            return {
              restrict : 'A' ,
              controller: function($scope) {
                $scope.confirmed = false;
                $scope.doConfirm = function(values) {
                  values.forEach(function(ele) {
                  if($scope.confirm == ele){
                    $scope.confirmed = true;
                  }else{
                    $scope.confirmed = false;
                  }
                  })

                }
              },
              link: function(scope , element ,  attrs) {
                attrs.$observe('match' , function() {
                  scope.matches = JSON.parse(attrs.match);
                   scope.doConfirm(scope.matches);
                });

                scope.$watch('confirm' , function() {
                  scope.matches = JSON.parse(attrs.match);
                   scope.doConfirm(scope.matches);
                  });
              }
            };
          })
