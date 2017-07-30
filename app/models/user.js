var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');
var nameValidator = [

  validate({
    validator: 'matches',
    arguments: /^(([a-zA-Z]{3,20})+[ ]+([a-zA-Z]{3,20})+)+$/,
    message: 'Name Must Have 2 Words With One space in between'

  }),
  validate({
    validator: 'isLength',
    arguments: [3,20],
    message: 'Name Must Have 2 Words With One space in between'

  })

];

var emailValidator = [

  validate({
        validator: 'isEmail',
        message: 'is not a valid email'
  }),
      validate({
              validator: 'isLength',
              arguments: [3, 50],
              message: 'Must be at least 3 charecters , No special Charecters, must have space between them'
  })
];
var usernameValidator = [
   validate({
        validator: 'isAlphanumeric',
        message: 'username must contain only letters or numbers'
   }),
      validate({
              validator: 'isLength',
              arguments: [3, 50],
              message: 'Username should be between 3-25 charecters'
      })
];

var passwordValidator = [
  validate({
    validator: 'matches',
    arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/,
    message: 'Needs 1 LowerCase,1 UpperCase,1 Number , 1Special Char ,At least 8-35 Charecters'
  }) ,
  validate({
          validator: 'isLength',
          arguments: [8,35],
          message: 'Password should be between 3-25 charecters'
  })
];

var UserSchema = new Schema({
  name : {type: String , required: true , validate: nameValidator},
  username : {type: String, lowercase: true, required: true , unique: true , validate: usernameValidator },
  password : {type: String , required: true , validate: passwordValidator , select: false },
  email : {type: String , lowercase: true, required: true , unique: true , validate: emailValidator} ,
  active : {type: Boolean , required: true , default: false} ,
  temporarytoken : {type: String , required: true} ,
  permission : {type: String , required: true , default: 'user'}

});

UserSchema.pre('save' , function(next){
   var user = this;



   if(!user.isModified('password')) return next();
   bcrypt.hash(user.password , null , null , function(err , hash) {
       if(err) return next(err);
       user.password = hash;
       next();
     });

});

UserSchema.plugin(titlize , {
  paths: ['name']
});

UserSchema.methods.comparePassword = function(password) {
  console.log('comparing passwords');
  return bcrypt.compareSync(password , this.password);
};
module.exports = mongoose.model('User' , UserSchema);
