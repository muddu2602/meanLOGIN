angular.module('mainController' , ['authServices' , 'userServices'])
        .controller('mainCtrl' , function(auth , $timeout , $location, $rootScope , $window , $interval , $route , User , AuthToken) {

          var app = this;
          app.loadme = false;

          app.checkSession = function() {
            if(auth.isLoggedIn()){
              app.checkingSession = true;

              var interval =  $interval(function () {
                var token = $window.localStorage.getItem('token');

                if(token === null){

                  $interval.cancel(interval);

                }else{

                  self.parseJwt = function(token) {
                      var base64url = token.split('.')[1];
                      var base64 = base64url.replace('-' , '+').replace('_' , '/');
                      return JSON.parse($window.atob(base64));
                  }

                  var expireTime = self.parseJwt(token);
                  //console.log(expireTime.exp);
                  var timeStamp = Math.floor(Date.now() / 1000 );
                  //console.log(timeStamp);
                  var timeCheck = expireTime.exp - timeStamp;
                  //console.log('timeCheck: ' + timeCheck);
                  if(timeCheck <= 25 ){
                  //  console.log('token  expired');
                    showModal(1);
                    $interval.cancel(interval);
                  }else{
                  //  console.log('token not yet  expired');
                  }
                }
              },10000);
            }
          }

          app.checkSession();


          var showModal = function(option) {
            app.choiceMade = false;
            app.modalHeader = undefined;
            app.modalBody = undefined;
            app.hideButton = false;
            if(option === 1){
              app.modalHeader = 'Time Out Warning';
              app.modalBody = 'Your Session Will Expire in 5 Minutes';
              $("#myModal").modal({backdrop: "static"});

            }else if(option === 2 ){
              //Logout Part
              app.hideButton = true;
              app.modalHeader = 'Logging Out';
              $("#myModal").modal({backdrop: "static"});
              $timeout(function() {
                app.hideButton = true;
                auth.logout();
                $location.path('/');
                app.hideModal();
                $route.reload();
              } , 4000)


            }

            $timeout(function() {
              console.log('Session LOGGED OUT!!!!!!');
              app.hideModal();
            } , 4000);


          };
          app.endSession = function() {
              console.log('Session is ended ');

              app.choiceMade = true;

              $timeout(function() {
                showModal(2);
              } , 2000)
          };

          app.hideModal = function() {
            $("#myModal").modal('hide');
          };

          app.renewSession = function() {
            app.choiceMade = true;

            User.renewSession(app.username).then(function(data) {

              if(data.data.success){
                AuthToken.setToken(data.data.token);
                app.checkSession();
              }else{
                app.modalBody = data.data.message;
              }

            });
          };
          $rootScope.$on('$routeChangeStart',function(){
            if(!app.checkSession) app.checkSession();

            if(auth.isLoggedIn()){
              console.log('User is logged in');
              app.LoggedIn = true;
              auth.getUser().then(function(data){
                app.username = data.data.username;
                app.email = data.data.email;
                User.getPermission().then(function(data) {
                  if(data.data.permission === 'admin' || data.data.permission ==='moderator'){
                    app.authorized = true;
                    app.loadme = true;
                  }else{
                      app.loadme = true;
                  }
                });



              });
            }
            else{
              app.LoggedIn = false;
              app.username = '';
              app.loadme = true;

            }
          });

          if($location.hash() == '_#_')$location.hash(null);

          this.doLogin = function(loginData) {
            app.loading = true;
            app.errorMsg = false;
            console.log('user submittted the form');
            auth.login(app.loginData).then(function(data) {
              if(data.data.success){
                //console successs message
                //user is created
                app.loading = false;
                app.SuccessMsg = data.data.message + '....Redirecting ...';
                $timeout(function() {
                    $location.path('/about');
                    app.loginData = '';
                    app.SuccessMsg = false;
                    app.checkSession();
                } , 2000);

              }else{
                //show error
                app.loading = false;
                app.errorMsg = data.data.message;
              }


            });
          };

          this.logout = function() {
            showModal(2);
          };
        });
