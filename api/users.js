/**
*  Users file - CRUD routes - User get, create, update, delete
**/

const libData = require('../lib/data');
const helpers = require('../lib/helpers');

const users = {};

/*=============================
    Get existing user details
=============================*/

users.get = (data, callback) => {

};

/*=============================
    Create new user
=============================*/

users.post = (data, callback) => {
    const  { name, email, address, password } = data.payload;

    // validate input data
    const userData = { 
        name:  helpers.stringChecker(name, 1), 
        email: helpers.stringChecker(email, 5, '@'), 
        address: helpers.stringChecker(address, 1),
        password: helpers.stringChecker(password, 6) ? helpers.hash(password) : false,
    };

    // if data is valid proceed, otherwise return format error
    if (userData.name && userData.email && userData.address && userData.password) {

        // check if user already exists - by email address
        libData.read('users', email, (err, data) => {
            
            // err indicates that file does not exist, so proceed with user creation
            if (err) {

                // create a user json file with userData, 200 if success, 500 err
                libData.create('users', email, userData, err => {
                    if (!err) callback(200);
                    else callback(500, { 'error': 'could not create the new user'});
                });
            }
            else callback(500, {'error': 'a user with that email address already exists'});
        });
    }
    else callback(500, {'error': 'missing required fields or incorrectly formatted fields'});
};

/*=============================
   Update user details
=============================*/

users.put = (data, callback) => { callback(200) };

/*=============================
    Delete user
=============================*/

users.delete = (data, callback) => { callback(200) };

// exports
module.exports = users;