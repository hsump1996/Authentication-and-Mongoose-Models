const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = mongoose.model('User');

function register(username, email, password, errorCallback, successCallback) {

  //Check the length of the username and password passed in; they should both be greater than or equal to 8
  if (username.length() < 8 || password.length < 8) {

    const id_pw_short_error = {message: "USERNAME PASSWORD TOO SHORT"};
    console.log(id_pw_short_error);
    errorCallback(id_pw_short_error);

  }

  //Check if the user already exists
  User.findOne({ 'username' :  username }, (err, result, count) => { 
    
    //If any, log the error to the console (server)
    if(err) {

      console.log(err);

    //Case where the user already exists
    } else if (result) {

      const user_exists_error = {message: "USERNAME ALREADY EXISTS"};
      console.log(user_exists_error);
      errorCallback(user_exists_error) 

    // Case where the user doesn't exist yet  
    } else {

        bcrypt.hash(password, 10, function(err, hash) {
        
        if (err) {

          console.log(err);

        } else {

          // Instantiate a new User object
          let newUser = new User();
          newUser.name = username;
          newUser.email = email;
          newUser.password = hash;

          // Calls save
          newUser.save((err)=>{
            

            //If error, calls the errorCallback with an object that contains the key, message, and a generic error message, 
            //DOCUMENT SAVE ERROR, as the value
            if (err) {
              const save_error = {message: "DOCUMENT SAVE ERROR"};
              console.log(save_error);
              errorCallback()
            
            // If the save succeeds, call the successCallback function with the newly saved user
            } else {
              
              successCallback(newUser);
            
            }
        });
        }
      });
    }
  });



}

function login(username, password, errorCallback, successCallback) {
}

function startAuthenticatedSession(req, user, cb) {
}

module.exports = {
  startAuthenticatedSession: startAuthenticatedSession,
  register: register,
  login: login
};
