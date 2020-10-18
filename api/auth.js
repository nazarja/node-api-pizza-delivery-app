/**
*  Auth File - Handles Login and Logout Request - returns a token after login and destroys after logout
**/

const libData = require('../lib/data');
const helpers = require('../lib/helpers');
const tokens = require('./tokens');

const auth = {};

// methods - call login or logout
auth.post = (data, callback) => {
    data.path.includes('login')
        ? auth.login(data, callback)
        : auth.logout(data, callback)
};

// retrive user details and assign a token if successful
auth.login = (data, callback) => {
    const { email, password } = data.payload;

    const postData = {
        email: helpers.stringChecker(email, 5, '@'),
        password: helpers.stringChecker(password, 6) ? helpers.hash(password) : false,
    };

    // check input data is valid
    if (postData.email && postData.password) {

        // check user exists and retrive details
        libData.read('users', email, (err, fileData) => {
            if (!err && fileData) {

                // check password matches - continue
                if (postData.password === fileData.password) {

                    // create token for user
                    tokens.post(postData, (err, token) => {
                        if (!err && token) callback(200, { 'token': token });
                        else callback(500, { 'login error': err })
                    })
                }
                else callback(400, { 'error': 'username or password are invalid' })
            }
            else callback(400, { 'error': 'username or password are invalid' })
        });
    }
    else callback(500, { 'error': 'missing required fields or incorrectly formatted fields' });
};

// logout takes a token and  deletes it, the user must login again
auth.logout = (data, callback) => { 
    tokens.delete(data, err => {
        if (!err) callback(200, 'You have been logged out successfully.');
        else callback(500, {'logout error': 'error logging out user'});
    });
};

// exports
module.exports = auth;