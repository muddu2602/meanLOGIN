angular.module('managementController' , [])
        .controller('managementCtrl' , function(User , $scope) {
          var app = this;

          app.errorMsg = false;
          app.editAccess = false;
          app.deleteAccess = false;
          app.limit = 5;
          app.loading = true;
          app.accessDenied = true;
          function getUsers() {

            User.getUsers().then(function(data) {
              if(data.data.success){
                if(data.data.permission === 'admin' || data.data.permission === 'moderator'){
                  app.users = data.data.users;
                  app.loading= false;
                  app.accessDenied = false;
                  if(data.data.permission === 'admin'){
                    app.editAccess = true;
                    app.deleteAccess = true;
                  }else if(data.data.permission === 'moderator'){
                    app.editAccess = true;

                  }
                }else{
                  res.json({success: false , message: 'Insuffient Permissions'});
                  app.loading = false;
                }
              }else{
                app.errorMsg = data.data.message
              }
            })
          }
          getUsers();
          app.applyFilters = function(number) {
            app.showErrorMsg = false;
            if(number > -1){
              app.limit  = number;
            }
            else{
              app.showErrorMsg = 'Please enter Valid Number';
            }
          }
          app.showMore = function() {
            app.limit = undefined;
            app.showErrorMsg = false;
          }
          app.deleteUser = function(username) {
            console.log('delete user methd');
            User.deleteUser(username).then(function(data) {
              if(data.data.success){
                getUsers();
              }else{
                app.showErrorMsg =  data.data.message;
              }
            });
          }
          app.search = function(searchKeyword , number) {

            console.log('clicked search');
              if(searchKeyword){
                if(searchKeyword.length > 0){
                  app.limit = 0;
                  $scope.searchFilter = searchKeyword;
                  app.limit = number;

                }else{
                  $scope.searchFilter = undefined;
                  app.limit = 0;

                }

              }else{
                $scope.searchFilter = undefined;
                app.limit = 0;
              }
          }

          app.clear = function() {
            console.log('clicked clear');
            $scope.number = 'Clear';
            app.limit = 0;
            $scope.searchKeyword = undefined;
            $scope.searchFilter = undefined;
            app.showErrorMsg = false;
          }
        })

        .controller('editCtrl', function($scope, $routeParams, User, $timeout) {
      var app = this;
      $scope.nameTab = 'active'; // Set the 'name' tab to the default active tab
      app.phase1 = true; // Set the 'name' tab to default view

      // Function: get the user that needs to be edited
      User.getUser($routeParams.id).then(function(data) {
          // Check if the user's _id was found in database
          if (data.data.success) {
              $scope.newName = data.data.user.name; // Display user's name in scope
              $scope.newEmail = data.data.user.email; // Display user's e-mail in scope
              $scope.newUsername = data.data.user.username; // Display user's username in scope
              $scope.newPermission = data.data.user.permission; // Display user's permission in scope
              app.currentUser = data.data.user._id; // Get user's _id for update functions
          } else {
              app.errorMsg = data.data.message; // Set error message
              $scope.alert = 'alert alert-danger'; // Set class for message
          }
      });

      // Function: Set the name pill to active
      app.namePhase = function() {
          $scope.nameTab = 'active'; // Set name list to active
          $scope.usernameTab = 'default'; // Clear username class
          $scope.emailTab = 'default'; // Clear email class
          $scope.permissionsTab = 'default'; // Clear permission class
          app.phase1 = true; // Set name tab active
          app.phase2 = false; // Set username tab inactive
          app.phase3 = false; // Set e-mail tab inactive
          app.phase4 = false; // Set permission tab inactive
          app.errorMsg = false; // Clear error message
      };

      // Function: Set the e-mail pill to active
      app.emailPhase = function() {
          $scope.nameTab = 'default'; // Clear name class
          $scope.usernameTab = 'default'; // Clear username class
          $scope.emailTab = 'active'; // Set e-mail list to active
          $scope.permissionsTab = 'default'; // Clear permissions class
          app.phase1 = false; // Set name tab to inactive
          app.phase2 = false; // Set username tab to inactive
          app.phase3 = true; // Set e-mail tab to active
          app.phase4 = false; // Set permission tab to inactive
          app.errorMsg = false; // Clear error message
      };

      // Function: Set the username pill to active
      app.usernamePhase = function() {
          $scope.nameTab = 'default'; // Clear name class
          $scope.usernameTab = 'active'; // Set username list to active
          $scope.emailTab = 'default'; // CLear e-mail class
          $scope.permissionsTab = 'default'; // CLear permissions tab
          app.phase1 = false; // Set name tab to inactive
          app.phase2 = true; // Set username tab to active
          app.phase3 = false; // Set e-mail tab to inactive
          app.phase4 = false; // Set permission tab to inactive
          app.errorMsg = false; // CLear error message
      };

      // Function: Set the permission pill to active
      app.permissionsPhase = function() {
          $scope.nameTab = 'default'; // Clear name class
          $scope.usernameTab = 'default'; // Clear username class
          $scope.emailTab = 'default'; // Clear e-mail class
          $scope.permissionsTab = 'active'; // Set permission list to active
          app.phase1 = false; // Set name tab to inactive
          app.phase2 = false; // Set username to inactive
          app.phase3 = false; // Set e-mail tab to inactive
          app.phase4 = true; // Set permission tab to active
          app.disableUser = false; // Disable buttons while processing
          app.disableModerator = false; // Disable buttons while processing
          app.disableAdmin = false; // Disable buttons while processing
          app.errorMsg = false; // Clear any error messages
          // Check which permission was set and disable that button
          if ($scope.newPermission === 'user') {
              app.disableUser = true; // Disable 'user' button
          } else if ($scope.newPermission === 'moderator') {
              app.disableModerator = true; // Disable 'moderator' button
          } else if ($scope.newPermission === 'admin') {
              app.disableAdmin = true; // Disable 'admin' button
          }
      };

      // Function: Update the user's name
      app.updateName = function(newName, valid) {
          app.errorMsg = false; // Clear any error messages
          app.disabled = true; // Disable form while processing
          // Check if the name being submitted is valid
          if (valid) {
              var userObject = {}; // Create a user object to pass to function
              userObject._id = app.currentUser; // Get _id to search database
              userObject.name = $scope.newName; // Set the new name to the user
              // Runs function to update the user's name
              User.editUser(userObject).then(function(data) {
                  // Check if able to edit the user's name
                  if (data.data.success) {
                      $scope.alert = 'alert alert-success'; // Set class for message
                      app.successMsg = data.data.message; // Set success message
                      // Function: After two seconds, clear and re-enable
                      $timeout(function() {
                          app.nameForm.name.$setPristine(); // Reset name form
                          app.nameForm.name.$setUntouched(); // Reset name form
                          app.successMsg = false; // Clear success message
                          app.disabled = false; // Enable form for editing
                      }, 2000);
                  } else {
                      $scope.alert = 'alert alert-danger'; // Set class for message
                      app.errorMsg = data.data.message; // Clear any error messages
                      app.disabled = false; // Enable form for editing
                  }
              });
          } else {
              $scope.alert = 'alert alert-danger'; // Set class for message
              app.errorMsg = 'Please ensure form is filled out properly'; // Set error message
              app.disabled = false; // Enable form for editing
          }
      };

      // Function: Update the user's e-mail
      app.updateEmail = function(newEmail, valid) {
          app.errorMsg = false; // Clear any error messages
          app.disabled = true; // Lock form while processing
          // Check if submitted e-mail is valid
          if (valid) {
              var userObject = {}; // Create the user object to pass in function
              userObject._id = app.currentUser; // Get the user's _id in order to edit
              userObject.email = $scope.newEmail; // Pass the new e-mail to save to user in database
              // Run function to update the user's e-mail
              User.editUser(userObject).then(function(data) {
                  // Check if able to edit user
                  if (data.data.success) {
                      $scope.alert = 'alert alert-success'; // Set class for message
                      app.successMsg = data.data.message; // Set success message
                      // Function: After two seconds, clear and re-enable
                      $timeout(function() {
                          app.emailForm.email.$setPristine(); // Reset e-mail form
                          app.emailForm.email.$setUntouched(); // Reset e-mail form
                          app.successMsg = false; // Clear success message
                          app.disabled = false; // Enable form for editing
                      }, 2000);
                  } else {
                      $scope.alert = 'alert alert-danger'; // Set class for message
                      app.errorMsg = data.data.message; // Set error message
                      app.disabled = false; // Enable form for editing
                  }
              });
          } else {
              $scope.alert = 'alert alert-danger'; // Set class for message
              app.errorMsg = 'Please ensure form is filled out properly'; // Set error message
              app.disabled = false; // Enable form for editing
          }
      };

      // Function: Update the user's username
      app.updateUsername = function(newUsername, valid) {
          app.errorMsg = false; // Clear any error message
          app.disabled = true; // Lock form while processing
          // Check if username submitted is valid
          if (valid) {
              var userObject = {}; // Create the user object to pass to function
              userObject._id = app.currentUser; // Pass current user _id in order to edit
              userObject.username = $scope.newUsername; // Set the new username provided
              // Runs function to update the user's username
              User.editUser(userObject).then(function(data) {
                  // Check if able to edit user
                  if (data.data.success) {
                      $scope.alert = 'alert alert-success'; // Set class for message
                      app.successMsg = data.data.message; // Set success message
                      // Function: After two seconds, clear and re-enable
                      $timeout(function() {
                          app.usernameForm.username.$setPristine(); // Reset username form
                          app.usernameForm.username.$setUntouched(); // Reset username form
                          app.successMsg = false; // Clear success message
                          app.disabled = false; // Enable form for editing
                      }, 2000);
                  } else {
                      app.errorMsg = data.data.message; // Set error message
                      app.disabled = false; // Enable form for editing
                  }
              });
          } else {
              app.errorMsg = 'Please ensure form is filled out properly'; // Set error message
              app.disabled = false; // Enable form for editing
          }
      };

      // Function: Update the user's permission
      app.updatePermissions = function(newPermission) {
          app.errorMsg = false; // Clear any error messages
          app.disableUser = true; // Disable button while processing
          app.disableModerator = true; // Disable button while processing
          app.disableAdmin = true; // Disable button while processing
          var userObject = {}; // Create the user object to pass to function
          userObject._id = app.currentUser; // Get the user _id in order to edit
          userObject.permission = newPermission; // Set the new permission to the user
          // Runs function to udate the user's permission
          User.editUser(userObject).then(function(data) {
              // Check if was able to edit user
              if (data.data.success) {
                  $scope.alert = 'alert alert-success'; // Set class for message
                  app.successMsg = data.data.message; // Set success message
                  // Function: After two seconds, clear and re-enable
                  $timeout(function() {
                      app.successMsg = false; // Set success message
                      $scope.newPermission = newPermission; // Set the current permission variable
                      // Check which permission was assigned to the user
                      if (newPermission === 'user') {
                          app.disableUser = true; // Lock the 'user' button
                          app.disableModerator = false; // Unlock the 'moderator' button
                          app.disableAdmin = false; // Unlock the 'admin' button
                      } else if (newPermission === 'moderator') {
                          app.disableModerator = true; // Lock the 'moderator' button
                          app.disableUser = false; // Unlock the 'user' button
                          app.disableAdmin = false; // Unlock the 'admin' button
                      } else if (newPermission === 'admin') {
                          app.disableAdmin = true; // Lock the 'admin' buton
                          app.disableModerator = false; // Unlock the 'moderator' button
                          app.disableUser = false; // unlock the 'user' button
                      }
                  }, 2000);
              } else {
                  $scope.alert = 'alert alert-danger'; // Set class for message
                  app.errorMsg = data.data.message; // Set error message
                  app.disabled = false; // Enable form for editing
              }
          });
      };


  });
