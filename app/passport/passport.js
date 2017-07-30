var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user')
var session = require('express-session');
var jwt  = require('jsonwebtoken');
var pass = 'harrypotter';
var GoogleStrategy = require('passport-google-oauth').OAuthStrategy;


module.exports = function(app , passport) {

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(session({secret: 'keyboard cat', resave: false,  saveUninitialized: true,  cookie: { secure: false } }));

  passport.serializeUser(function(user, done) {
    token =  jwt.sign({username: user.username, email: user.email} , pass , { expiresIn: '24h'} );

    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new FacebookStrategy({
    clientID: '758012867712115',
    clientSecret: '0ac4cd9633fbb8f1fdddc8fe08968d8e',
    callbackURL: "http://localhost:8080/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {

    console.log(profile);

    User.findOne({ email: 'profile._json.email'}).select('username email password').exec(function(err , user) {
      if(err) done(err)

      if(user && user!=null){
        done(null , user);
      }else{
        done(err);
      }
    });
    done(null, profile);
  }
));
passport.use(new GoogleStrategy({
  consumerKey: '634463801368-50a3j8842im408jsp7neqbtq6dsmctek.apps.googleusercontent.com',
  consumerSecret: 'ylUKA0T0sS66_xrT7MO1E7J-',
  callbackURL: "http://localhost:8080/auth/google/callback" ,
  profileFields: ['id', 'displayName', 'photos', 'email']


},function(token, tokenSecret, profile, done) {
  console.log(profile);
  done(null, profile);
}
));

//Google routes

app.get('/auth/google', passport.authenticate('google', {scope: 'https://www.google.com/m8/feeds'}));

app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/login'}), function(req, res) {
  res.redirect('/googleerror/' + token);
});


//facebook routes

app.get('/auth/facebook/callback',  passport.authenticate('facebook', {  failureRedirect: '/googleerror' }) , function(req , res) {
  res.redirect('/facebook/' + token);
});
app.get('/auth/facebook',  passport.authenticate('facebook', { scope: 'email' }));


return passport;
}
