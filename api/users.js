/**
*  Users file - CRUD routes - User get, create, update, delete
**/

const libData = require('../lib/data');
const tokens = require('./tokens');
const helpers = require('../lib/helpers');

const users = {};

/*=============================
    Get existing user details
=============================*/

users.get = (data, callback) => {
    const { token } = data.headers;
    const { email } = data.payload;

    // perform suth check for token and email
    tokens.authCheck(token, email, err => {
        if (!err) {
            // read the user file and return content
            libData.read('users', email, (err, fileData) => {
                if (!err && fileData) {
                    delete fileData.password;
                    callback(200, fileData);
                }
                else callback(404);
            })
        }
        else callback(405, { 'error': 'unauthorized:' + err });
    });
};

/*=============================
    Create new user
=============================*/

users.post = (data, callback) => {
    const { name, email, address, password } = data.payload;

    // validate input data
    const userData = {
        name: helpers.stringChecker(name, 1),
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
                    else callback(500, { 'error': 'could not create the new user' });
                });
            }
            else callback(500, { 'error': 'a user with that email address already exists' });
        });
    }
    else callback(500, { 'error': 'missing required fields or incorrectly formatted fields' });
};

/*=============================
   Update user details
=============================*/

users.put = (data, callback) => {
    const { token } = data.headers;
    const { email, name, address, password } = data.payload;

    // auth check
    tokens.authCheck(token, email, err => {
        if (!err) {

            // input checks
            const userData = {
                name: helpers.stringChecker(name, 1),
                address: helpers.stringChecker(address, 1),
                password: helpers.stringChecker(password, 6) ? helpers.hash(password) : false,
            };

            // check if at least one input to change
            if (userData.name || userData.address || userData.password) {

                // get user data to for non updated fields
                libData.read('users', email, (err, fileData) => {
                    if (!err && fileData) {

                        // assign new field data
                        if (name) fileData.name = name;
                        if (address) fileData.address = address;
                        if (password) fileData.password = helpers.hash(password);

                        libData.update('users', email, fileData, err => {
                            if (!err) callback(200);
                            else callback(500, {'error': 'user could not be updated'});
                        });
                    }
                    else callback(400, { 'error': 'the user could not be found' });
                });
            }
            else callback(400, { 'error': 'missing at least one required field to update' })

        }
        else callback(405, { 'error': 'unauthorized:' + err });
    });
};

/*=============================
    Delete user
=============================*/

// delete user and associated orders
users.delete = (data, callback) => {
    const { token } = data.headers;
    const { email } = data.payload;

    // perform auth check for token and email
    tokens.authCheck(token, email, err => {
        if (!err) {

            // get order array for later deletion
            libData.read('users', email, (err, fileData) => {

                if (!err && fileData) {

                    libData.delete('users', email, err => {
                        if (!err) {

                            // if no errors, try to delete orders
                            const orders = fileData.orders;
                            if (orders.length) {
                                let errors = 0;

                                // loop and delete all orders
                                orders.forEach(order => {
                                    libData.delete('orders', email, err => {
                                        if (err) errors++;
                                    });
                                });

                                // if any errors occured, otherwise callback 200 ok
                                if (errors) callback(500, { 'error': 'error deleting all users orders' })
                                else callback(200);
                            };

                        }
                        else callback(500, { 'error': 'error deleting the user' })
                    })
                }
            })
        }
        else callback(405, { 'error': 'unauthorized:' + err });
    });
};


// exports
module.exports = users;