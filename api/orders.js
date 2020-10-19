/**
*  Orders File, post orders and complete payment with stripe
*  Order requires email, password and token
**/

const libData = require('../lib/data');
const helpers = require('../lib/helpers');
const tokens = require('./tokens');

const orders = {};

// get users previous orders
orders.get = (data, callback) => {
    const { token } = data.headers;

    // verify token
    tokens.verifyToken(token, (err, fileData) => {
        // if token id valid, try to find an orders file by the same email
        if (!err && fileData) {
            // read content of orders file
            libData.read('orders', fileData.email, (err, orderData) => {
                // return if it exists
                if (!err && orderData) callback(200, orderData);
                else callback(500, { 'error': 'could not find order' })
            })
        }
        else callback(401, { 'error': 'not authorised or badly formatted token' });
    });
};

// complete order
orders.post = (data, callback) => {
    let { email, password, stripeToken } = data.payload;
    const { token } = data.headers;

    // check for valid inputs
    email = helpers.stringChecker(email, 5, '@');
    password = helpers.stringChecker(password, 6) ? helpers.hash(password) : false;
    stripeToken = helpers.stringChecker(stripeToken, 7) && stripeToken.startsWith('tok_') ? stripeToken : false;

    if (email && password && stripeToken) {
        // confirm that the username and password and token are all valid before making purchase
        tokens.verifyToken(token, (err, fileData) => {
            // if token id valid, try to find an orders file by the same email
            if (!err && fileData) {
                // read content of users file
                libData.read('users', fileData.email, (err, userData) => {
                    // check that password match input data
                    if (!err && userData && userData.password === password) {

                        // check cart is not empty - proceed if contains items
                        if (userData.cart && userData.cart.length > 0) {

                            // push all errors to array
                            let errors = [];

                            // create order
                            let order = {
                                id: Date.now(),
                                items: userData.cart,
                                total: userData.cart.map(item => item.price * item.quantity).reduce((a, b) => a + b)
                            }

                            // only proceed if total is defined
                            if (typeof (order.total) === 'number') {

                                // try charge via stripe
                                helpers.charge(order.total, stripeToken, err => {

                                    // cherage was unsuccessful, stop operations
                                    if (err) errors.push({ error: err });

                                    // charge was successful
                                    else {

                                        // send email conformation
                                        helpers.mail(order, userData, err => {
                                            if (err) error.push({ 'error': err });
                                        });

                                        // empty cart
                                        userData.cart = [];

                                        // update users file to relect empty cart
                                        libData.update('users', userData.email, userData, err => {
                                            if (!err) errors.push({ 'error': 'error emptying users cart' });
                                        });

                                        // add to orders file
                                        libData.read('orders', userData.email, (err, orderData) => {

                                            // order file already exists, so append to file
                                            if (!err && orderData) {
                                                orderData.push(order);

                                                libData.update('orders', userData.email, orderData, err => {
                                                    if (err) errors.push({ 'error': 'error updating order file' });
                                                })
                                            }

                                            // order file doesnt exist, so create one and write to it
                                            else {
                                                order = [order];
                                                libData.create('orders', userData.email, order, err => {
                                                    if (err) errors.push({ 'error': 'error creating update file' });
                                                })
                                            };
                                        });
                                    }
                                });

                                // END: if any errors occurred
                                if (errors.length > 0) callback(500, { 'errors': errors });
                                // otherwise callback 200 ok
                                else callback(200);
                            }
                            else callback(500, { 'error': 'error getting cart items total' });
                        }
                        else callback(500, { 'error': 'error getting cart items' });
                    }
                    else callback(401, { 'error': 'invalid username or password' });
                })
            }
            else callback(401, { 'error': 'not authorised or badly formatted token' });
        });
    }
    else callback(401, { 'error': 'missing required fields' });
};


module.exports = orders;