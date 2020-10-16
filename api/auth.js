/**
*  Auth File - Handles Login and Logout Request - returns a token after login and destroys after logout
**/

const auth = {};

// methods
auth.get = (data, callback) => { callback(200) };
auth.post = (data, callback) => { callback(200) };
auth.put = (data, callback) => { callback(200) };
auth.delete = (data, callback) => { callback(200) };

// exports
module.exports = auth;