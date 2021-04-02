const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = mongoose.model('User');

function register(username, email, password, errorCallback, successCallback) {

  //Check the length of the username and password passed in; they should both be greater than or equal to 8
  if (username.length < 8 || password.length < 8) {

    const idPwShortError = {message: "USERNAME PASSWORD TOO SHORT"};
    console.log(idPwShortError);
    errorCallback(idPwShortError);
  
  } else {
    //Check if the user already exists
    User.findOne({username :  username }, (err, result) => { 
      
      //If any, log the error to the console (server)
      if(err) {

        console.log(err);

      //Case where the user already exists
      } else if (result) {

        const userExistsError = {message: "USERNAME ALREADY EXISTS"};
        console.log(userExistsError);
        errorCallback(userExistsError);

      // Case where the user doesn't exist yet  
      } else {
        
        bcrypt.hash(password, 10, function(err, hash) {
        
          if (err) {

            console.log(err);
            
          // Creates a new userr
          } else {

            // Instantiate a new User object
            const newUser = new User({username: username, password: hash, email: email});
            // Calls save
            newUser.save(err=>{
                
              //If error, calls the errorCallback with an object that contains the key, message, and a generic error message, 
              //DOCUMENT SAVE ERROR, as the value
              if (err) {
                const saveError = {message: "DOCUMENT SAVE ERROR"};
                console.log(saveError);
                errorCallback(saveError);
                  
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

  User.findOne({username: username}, (err, user) => {
    

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
          const passwordNoMatch = {message: "PASSWORDS DO NOT MATCH"};
          console.log(passwordNoMatch);
          errorCallback(passwordNoMatch);
        }
      });
    

    //Case 3: when the User cannot be found
    } else {
      const userNotFound = {message: "USER NOT FOUND"};
      console.log(userNotFound);
      errorCallback(userNotFound);
    }
   
  });
}

function startAuthenticatedSession(req, user, cb) {

  req.session.regenerate((err) => {
    
    if (!err) {   
      req.session.user = user; 
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
