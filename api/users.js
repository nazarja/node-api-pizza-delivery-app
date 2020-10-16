/**
*  Users file - CRUD routes - User get, create, update, delete
**/

const users = {};

// get user
users.get = (data, callback) => { callback(200) };

// create new user
users.post = (data, callback) => {
    const name = helpers.stringChecker(data.payload.name);
    const email = helpers.stringChecker(data.payload.name);
    const address = helpers.stringChecker(data.payload.name);

    const userData = { name: '', email: '', address: '' };
};

// update user details
users.put = (data, callback) => { callback(200) };

// delete user
users.delete = (data, callback) => { callback(200) };

// exports
module.exports = users;