/**
*  Application Router Object - routes located in /api directory
**/

// html serve routes
const pages = require('../routes/pages');
const accounts = require('../routes/accounts');
const session = require('../routes/session');


// api routes
const auth = require('../api/auth');
const users = require('../api/users');
const cart = require('../api/cart');
const menu = require('../api/menu');
const orders = require('../api/orders');

// router object - returns the routes request method function
const router = {
    // html serve routes
    '': pages.index,
    'accounts/create': accounts.create,
    'accounts/edit': accounts.edit,
    'accounts/deleted': accounts.deleted,
    'session/create': session.create,
    'session/delete': session.delete,
    'orders/all': orders.list,
    'orders/create': orders.create,


    // api routes
    'auth/login': (requestData, callback) => executeRequest(auth, requestData, callback),
    'auth/logout': (requestData, callback) => executeRequest(auth, requestData, callback),
    'api/users': (requestData, callback) => executeRequest(users, requestData, callback),
    'api/cart': (requestData, callback) => executeRequest(cart, requestData, callback),
    'api/menu': (requestData, callback) => executeRequest(menu, requestData, callback),
    'api/orders': (requestData, callback) => executeRequest(orders, requestData, callback),
    
    // other routes
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