/**
*  Application Router Object - routes located in /api directory
**/

const auth = require('../api/auth');
const users = require('../api/users');
const tokens = require('../api/tokens');
const cart = require('../api/cart');
const menu = require('../api/menu');

// router object
const router = {
    auth: (requestData, callback) => executeRequest(auth, requestData, callback),
    users: (requestData, callback) => executeRequest(users, requestData, callback),
    tokens: (requestData, callback) => executeRequest(tokens, requestData, callback),
    cart: (requestData, callback) => executeRequest(cart, requestData, callback),
    menu: (requestData, callback) => executeRequest(menu, requestData, callback),
    ping: (data, cb) => cb(200),
    notfound: (data, cb) => cb(404),
};

// check for accepted methods and execute method or 405 not allowed
const executeRequest = (route, requestData, callback) => {

    // default acceptable methods
    const acceptMethods = ['get', 'post', 'put', 'delete'];

    // check method is allowed and route contains method
    // if the route does not contain method, it is not allowed on that route
    if (acceptMethods.includes(requestData.method) && route[requestData.method]) {

        // call and execute the routes method
        route[requestData.method](requestData, callback);
    }
    else callback(405);
};

module.exports = router;