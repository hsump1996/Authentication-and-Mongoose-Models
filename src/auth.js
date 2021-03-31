const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = mongoose.model('User');

function register(username, email, password, errorCallback, successCallback) {

  //Check the length of the username and password passed in; they should both be greater than or equal to 8
  if (username.length < 8 || password.length < 8) {

    const id_pw_short_error = {message: "USERNAME PASSWORD TOO SHORT"};
    console.log(id_pw_short_error);
    errorCallback(id_pw_short_error);
  
  } else {
    //Check if the user already exists
    User.findOne({username :  username }, (err, result, count) => { 
      
      //If any, log the error to the console (server)
      if(err) {

        console.log(err);

      //Case where the user already exists
      } else if (result) {

        const user_exists_error = {message: "USERNAME ALREADY EXISTS"};
        console.log(user_exists_error);
        errorCallback(user_exists_error);

      // Case where the user doesn't exist yet  
      } else {
        
        bcrypt.hash(password, 10, function(err, hash) {
        
          if (err) {

            console.log(err);
            
          // Creates a new userr
          } else {

            // Instantiate a new User object
            let newUser = new User({username: username, password: hash, email: email});
            // Calls save
            newUser.save(err=>{
                
              //If error, calls the errorCallback with an object that contains the key, message, and a generic error message, 
              //DOCUMENT SAVE ERROR, as the value
              if (err) {
                const save_error = {message: "DOCUMENT SAVE ERROR"};
                console.log(save_error);
                errorCallback(save_error);
                  
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
}

function login(username, password, errorCallback, successCallback) {

  User.findOne({username: username}, (err, user, count) => {
    

    //Case 1: when an error occurred
    if (err) {

      console.log(err);

    //Case 2: when there is a matching user
    } else if (!err && user) {
      
      // compare with form password!
      bcrypt.compare(password, user.password, (err, passwordMatch) => {
        // regenerate session if passwordMatch is true

        //Case a: Password Error
        if (err) {

          console.log(err);
        
        //Case b: When there is a matching password
        } else if (passwordMatch) {
          successCallback(user);
        
        //Case c: when the password does not match
        } else {
          const password_no_match = {message: "PASSWORDS DO NOT MATCH"};
          console.log(password_no_match);
          errorCallback(password_no_match);
        }
      });
    

    //Case 3: when the User cannot be found
    } else {
      const user_not_found = {message: "USER NOT FOUND"};
      console.log(user_not_found);
      errorCallback(user_not_found);
    }
   
  });
}

function startAuthenticatedSession(req, user, cb) {

  req.session.regenerate((err) => {
    
    if (!err) {   
      req.session.user = user.username; 
      req.session.email = user.email;
      cb();

    } else {
    // log out errorcall callback with error
      console.log(err);
    }
  });
}

module.exports = {
  startAuthenticatedSession: startAuthenticatedSession,
  register: register,
  login: login
};
