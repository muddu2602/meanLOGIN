var User = require('../models/user');
var jwt  = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var pass = 'harrypotter';
module.exports = function(router){

var options = {
  auth: {
    api_user: 'Sendgrid8',
    api_key: 'password8'
  }
}
var client = nodemailer.createTransport(sgTransport(options));
  //USER registration
  router.post('/users' , function(req,res){
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;
    user.name = req.body.name;


    user.active = false;

    user.temporarytoken = jwt.sign({username: user.username, email: user.email} , pass , { expiresIn: '24h'} );
    if(req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == '' || req.body.email == null || req.body.email == ''|| req.body.name == '' || req.body.name == null  )
    {
      res.json({ success : false ,message  :  'Username,password and email are mandatory'  });
    }
    else{
    user.save(function(err){
  if(err){
      if(err.errors != null){
            if(err.errors.name){
                    res.json({  success : false ,  message : err.errors.name.message });
            }else if(err.errors.email){
                    res.json({  success : false ,  message : err.errors.email.message  });
            }else if(err.errors.username){
                    res.json({  success : false ,  message : err.errors.username.message  });
            }else if(err.errors.password){
                    res.json({  success : false ,  message : err.errors.password.message  });
            }else{
                    res.json({  success : false ,  message  : err });
            }
          } else if(err){
            if(err.code == 11000){
              res.json({ success : false ,  message  : "username or email already taken" });

            }else{
              res.json({ success : false ,  message  : err });

            }
          }
      }
        else{
          var email = {
            from: 'Localhost staff , staff@localhost.com',
            to: user.email,
            subject: 'Localhost activation Link',
            text: 'Hello' + user.name + ', ThankYOU for registering....please click on link for activating your account at  http://localhost:8080/activate/' + user.temporarytoken ,
            html: 'Hello<strong>'+ user.name +'</strong> <br><br>, ThankYOU for registering....please click on link for activating your account<br><br><a href="http://localhost:8080/activate/' + user.temporarytoken + ' ">http://localhost:8080/activate</a>'
          };

          client.sendMail(email, function(err, info){
            if(err){
              console.log(err);
            }else{
              console.log('Message sent: ' + info.response);
            }
          });
          user.active = true;
        res.json({ success: true , message: 'Account Registered!!!! check your email for activation.'});
      }

   });
 }
});




  //user Login

  router.post('/authenticate' , function(req , res) {
    User.findOne({username: req.body.username}).select('email username password active').exec(function(err , user) {

      if(err) throw err ;
      if(!user){
        res.json({success: false , message: ' Could Not authenticate user'});
      }else if(user){
        if(req.body.password){
          var validPassword = user.comparePassword(req.body.password);
        }
        else{
          res.json({success: false , message: ' password not provided '});
        }
        if(!validPassword){
          res.json({ success: false , message:'Could Not authenticate user'});
        }else if(user.active){
          res.json({ success: false , message: 'Account not yet activated'});
        }

        else{
           var token =  jwt.sign({username: user.username, email: user.email} , pass , { expiresIn: '30s'} );
           res.json({success: true , message: 'user authenticated' , token: token});
        }
      }
    });
  });

  router.post('/checkusername' , function(req , res) {
    User.findOne({username: req.body.username}).select('username').exec(function(err , user) {

      if(err) throw err ;
      if(user){
        res.json({ success: false , message: 'username is already taken'});
      }else{
        res.json({ success: true , message: 'Valid Username'});
      }
    });
  });


  router.post('/checkemail' , function(req , res) {
    User.findOne({username: req.body.email}).select('email').exec(function(err , user) {

      if(err) throw err ;
      if(user){
        res.json({ success: false , message: 'E-mail is already taken'});
      }else{
        res.json({ success: true , message: 'Valid E-mail'});
      }
    });
  });

  router.put('/activate/:token' , function(req , res) {
    User.findOne({temporarytoken: req.params.token} ,function(err , user) {

      if(err) throw err;
       var token  = req.params.token;

       jwt.verify(token , pass , function(err , decoded , user) {
         if(err , user){
           console.log(user.active);
           res.json({ success: false , message: 'Invalid Token'});

         }else if(!user){
           res.json({success: false , message: 'Not Valid User'});
         }else{
           user.temporarytoken = false;
           user.active = true;
           user.save(function(err) {
             if(err){
                throw err;
             }else{
               var email = {
                 from: 'Localhost staff , staff@localhost.com',
                 to: user.email,
                 subject: 'Localhost Account Activated',
                 text: 'Hello'+ user.name +', Your Email has been successfully activated '  ,
                 html: 'Hello<strong>'+ user.name +'</strong><br><br>Account activated successfully'
               };
               client.sendMail(email , function(err , info) {
                 if(err){
                   throw err;
                 }else{
                   console.log('Verified ..  email sent');
                   console.log('Message sent' + info.response);
                 }
               });
               res.json({success: true , message: 'Account Verified'});
             }
           });
         }
       });
    });
  });

  router.get('/resetusername/:email' , function(req,res) {

    User.findOne({email: req.params.email}).select('email username name').exec(function(err, user) {
      if(err) {
        res.json({success: false , message: err})
      } else if(!user){
        res.json({success: false , message: 'Email Was not Found'});
      }
      else{
        var email = {
          from: 'Localhost staff , staff@localhost.com',
          to: user.email,
          subject: 'Localhost Username Request',
          text: 'Hello'+ user.name +', You Recently Requested for your username: Please save it in your files: ' + user.username  ,
          html: 'Hello<strong>'+ user.name +'</strong><br><br>Your Username is ' + user.username
        }
        client.sendMail(email , function(err , info) {

          if(err) console.log(err);
          else{
            console.log('Message' + info.response);
          }

        })

        res.json({success: true , message:'Username Has been sent to Email'})
      }

    });

  });

   router.put('/resetpassword' , function(req , res) {
      User.findOne({username : req.body.username}).select('username resettoken name email').exec(function(err , user) {

        if(err) throw err;

        if(!user){
          res.json({success: false , message:'No Such User Found'});
        } else{
          user.resettoken = jwt.sign({username: user.username, email: user.email} , pass , { expiresIn: '24h'} );
            user.save(function(err) {

              if(err){
                res.json({success: false , message : err});
              }else{

                var email = {
                 from: 'Localhost staff , staff@localhost.com',
                 to: user.email,
                 subject: 'Password reset Request',
                 text: 'Hello' + user.name + 'Your password reset link is http://localhost:8080/newpassword/ ' + user.resettoken,
                 html: 'Hello<strong>'+ user.name +'</strong> <br><br>, Your Password reset link is <a href="http://localhost:8080/reset/' + user.resettoken + '">http://localhost:8080/reset/</a>' + user.password
               };

               client.sendMail(email, function(err, info){
                 if(err){
                   console.log('Got an err');
                 }else{
                   console.log('Message sent: ' + info.response);
                 }
               });
                res.json({success: true , message: 'PLease Check your Email for Password Reset Link'});
                }
             });
          }
      });
  });




  router.use(function(req , res , next) {
     var token = req.body.token || req.body.query || req.headers['x-access-token'];

     if(token){
       //verify token
       jwt.verify(token , pass , function(err , decoded) {
         if(err){
           res.json({success: false , message:' invalid token'});
         }else{
           req.decoded = decoded;
           next();
         }
       });
     }
     else{
       res.json({success: false , message: 'Un-Authenticated token'});
     }
  });

  router.post('/me' , function(req , res) {
     res.send(req.decoded);
  });


  router.get('/renewToken/:username' , function(req , res) {

    User.findOne({ username: req.params.username} , function(err,user) {

      if(err) throw err;

      if(!user){
        res.json({success: false , message: ' No Such User Found'});
      } else{

        var newToken =  jwt.sign({username: user.username, email: user.email} , pass , { expiresIn: '24h'} );
        res.json({success: true , token: newToken});
      }

    });

  })

  router.get('/permission' , function(req , res) {

    User.findOne({username: req.decoded.username} , function(err, user) {

      if(err) throw err;

      if(!user){
        res.json({success: false , message: 'No such user found' });
      }else{
      //  console.log('Success User');
        res.json({success: true , permission: user.permission});
      }

    });
  });
  router.get('/management' , function(req, res) {
    User.find({} , function(err , users) {

      if(err)  throw err;

      User.findOne({username: req.decoded.username} , function(err , mainUser) {

        if(err) throw err;

        if(!mainUser){
          res.json({success: false , message: 'No Such User Found'});
        }else{
          if(mainUser.permission ==='admin' || mainUser.permission === 'moderator'){
            if(!users){
              res.json({success: false , message: ' NO such users are Found'});
            }else{
              res.json({success: true, users: users , permission: mainUser.permission});
            }

          }else{
            res.json({success: false , message: 'Insuffient Permissions'});
          }
        }

      });

    });

  });

  router.delete('/management/:username'  , function(req, res) {

   var deletedUser = req.params.username;
   var cuser = req.decoded.username;
    User.findOne({ username: req.decoded.username} , function(err , mainUser) {


      if(err) throw err;

      if(!mainUser){
        res.json({ success: false , message: 'No such User Found'});
      }else{

        if(mainUser.permission !== 'admin'){
          res.json({ success: false , message: 'Insuffient permissions'});
        }else{
          User.findOneAndRemove({username:  deletedUser} , function(err , user) {


            res.json({success: true});
          });
        }

      }

    });

  });

  router.get('/edit/:id', function(req, res) {
       var editUser = req.params.id; // Assign the _id from parameters to variable
       User.findOne({ username: req.decoded.username }, function(err, mainUser) {
           if (err) {

               //res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
           } else {
               // Check if logged in user was found in database
               if (!mainUser) {
                   res.json({ success: false, message: 'No user found' }); // Return error
               } else {
                   // Check if logged in user has editing privileges
                   if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                       // Find the user to be editted
                       User.findOne({ id: editUser }, function(err, user) {
                           if (err) {
                               console.log(err);
                               //res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                           } else {
                               // Check if user to edit is in database
                               if (!user) {
                                   res.json({ success: false, message: 'No user found' }); // Return error
                               } else {
                                   res.json({ success: true, user: user }); // Return the user to be editted
                               }
                           }
                       });
                   } else {
                       res.json({ success: false, message: 'Insufficient Permission' }); // Return access error
                   }
               }
           }
       });
   });
  router.put('/edit', function(req, res) {
        var editUser = req.body._id; // Assign _id from user to be editted to a variable
        if (req.body.name) var newName = req.body.name; // Check if a change to name was requested
        if (req.body.username) var newUsername = req.body.username; // Check if a change to username was requested
        if (req.body.email) var newEmail = req.body.email; // Check if a change to e-mail was requested
        if (req.body.permission) var newPermission = req.body.permission; // Check if a change to permission was requested
        // Look for logged in user in database to check if have appropriate access
        User.findOne({ username: req.decoded.username }, function(err, mainUser) {
            if (err) {
              console.log(err);
                //res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if logged in user is found in database
                if (!mainUser) {
                    res.json({ success: false, message: "no user found" }); // Return error
                } else {
                    // Check if a change to name was requested
                    if (newName) {
                        // Check if person making changes has appropriate access
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            // Look for user in database
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    console.log(err);
                                  //  res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        user.name = newName; // Assign new name to user in database
                                        // Save changes
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log any errors to the console
                                            } else {
                                                res.json({ success: true, message: 'Name has been updated!' }); // Return success message
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }

                    // Check if a change to username was requested
                    if (newUsername) {
                        // Check if person making changes has appropriate access
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            // Look for user in database
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                  console.log(err);
                                  //  res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        user.username = newUsername; // Save new username to user in database
                                        // Save changes
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Username has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }

                    // Check if change to e-mail was requested
                    if (newEmail) {
                        // Check if person making changes has appropriate access
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            // Look for user that needs to be editted
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    console.log(err);
                                    //res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if logged in user is in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        user.email = newEmail; // Assign new e-mail to user in databse
                                        // Save changes
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'E-mail has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }

                    // Check if a change to permission was requested
                    if (newPermission) {
                        // Check if user making changes has appropriate access
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            // Look for user to edit in database
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    console.log(err);
                                    //res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is found in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        // Check if attempting to set the 'user' permission
                                        if (newPermission === 'user') {
                                            // Check the current permission is an admin
                                            if (user.permission === 'admin') {
                                                // Check if user making changes has access
                                                if (mainUser.permission !== 'admin') {
                                                    res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade an admin.' }); // Return error
                                                } else {
                                                    user.permission = newPermission; // Assign new permission to user
                                                    // Save changes
                                                    user.save(function(err) {
                                                        if (err) {
                                                            console.log(err); // Long error to console
                                                        } else {
                                                            res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                        }
                                                    });
                                                }
                                            } else {
                                                user.permission = newPermission; // Assign new permission to user
                                                // Save changes
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); // Log error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                    }
                                                });
                                            }
                                        }
                                        // Check if attempting to set the 'moderator' permission
                                        if (newPermission === 'moderator') {
                                            // Check if the current permission is 'admin'
                                            if (user.permission === 'admin') {
                                                // Check if user making changes has access
                                                if (mainUser.permission !== 'admin') {
                                                    res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade another admin' }); // Return error
                                                } else {
                                                    user.permission = newPermission; // Assign new permission
                                                    // Save changes
                                                    user.save(function(err) {
                                                        if (err) {
                                                            console.log(err); // Log error to console
                                                        } else {
                                                            res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                        }
                                                    });
                                                }
                                            } else {
                                                user.permission = newPermission; // Assign new permssion
                                                // Save changes
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); // Log error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                    }
                                                });
                                            }
                                        }

                                        // Check if assigning the 'admin' permission
                                        if (newPermission === 'admin') {
                                            // Check if logged in user has access
                                            if (mainUser.permission === 'admin') {
                                                user.permission = newPermission; // Assign new permission
                                                // Save changes
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); // Log error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                    }
                                                });
                                            } else {
                                                res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to upgrade someone to the admin level' }); // Return error
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                }
            }
        });
    });

  return router;
}
