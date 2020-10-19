/**
*  Shopping Cart file - CRUD routes - User can create, add, remove and delete items from their cart
*  performing quantity on the cart does not require auth except for the token
*  password and email will be required upon order payment
**/

const libData = require('../lib/data');
const tokens = require('./tokens');
const items = require('../.data/menu/items.json');

const cart = {};

/*=============================
    Get and return all carts items
=============================*/

cart.get = (data, callback) => {
    const { token } = data.headers;

    // verify token
    tokens.verifyToken(token, (err, fileData) => {
        // if token id valid, read user file and if cart exists return cart
        if (!err && fileData) {
            // read content of users file
            libData.read('users', fileData.email, (err, userData) => {
                if (!err && userData) {
                    if (userData.hasOwnProperty('cart')) callback(200, userData.cart);
                    else callback(404, { 'error': 'cart is empty or does not exist' })
                }
                else callback(500, { 'error': 'could not find user' })
            })
        }
        else callback(401, { 'error': 'not authorised or badly formatted token' });
    });
};

/*=============================
    Add item if new otherwise 
    update users cart with
    updated quantity
=============================*/

cart.post = (data, callback) => {
    const { token } = data.headers;
    let { id: itemID } = data.payload;

    // check for itemID to add
    itemID = typeof (itemID) === 'number' && itemID < items.length && itemID >= 0 ? itemID : false;

    if (itemID >= 0) {

        // verify token
        tokens.verifyToken(token, (err, fileData) => {
            // if token id valid, add menuID to user 'cart'
            if (!err && fileData) {
                // read content of users file
                libData.read('users', fileData.email, (err, userData) => {
                    if (!err && userData) {
                        if (!userData.hasOwnProperty('cart')) userData.cart = [];

                        // check if item already exists, if so update quantity
                        if (userData.cart.length) {
                            let updatedQuantity = false;

                            // if item exists, update quantity
                            for (let i = 0; i < userData.cart.length; i++) {
                                if (userData.cart[i].id === itemID) {
                                    userData.cart[i].quantity++;
                                    updatedQuantity = true;
                                    break;
                                }
                            }

                            // if nothing updated push new item
                            if (!updatedQuantity) {
                                items[itemID].quantity = 1;
                                userData.cart.push(items[itemID])
                            };

                        }
                        else userData.cart.push(items[itemID])

                        // update users file with updated cart contents
                        libData.update('users', userData.email, userData, err => {

                            if (!err) callback(200, { 'cart': userData.cart });
                            else callback(500, { 'error': 'error updating users cart' });
                        });
                    }
                    else callback(500, { 'error': 'could not find user to update cart' })
                })
            }
            else callback(401, { 'error': err })
        })
    }
    else callback(404, { 'error': 'menu item not found' })
};

/*=============================
    Update quantity in users cart,
    if quantity is 0, remove item
=============================*/

cart.put = (data, callback) => {
    const { token } = data.headers;
    let { id: itemID, quantity } = data.payload;

    // check for itemID to add
    itemID = typeof (itemID) === 'number' && itemID < items.length && itemID >= 0 ? itemID : false;
    quantity = typeof (quantity) === 'number' && quantity > -1 ? quantity : false;

    if (itemID >= 0 && quantity >= 0) {

        // verify token
        tokens.verifyToken(token, (err, fileData) => {
            // if token id valid, read user file and if cart exists update item id it exists
            if (!err && fileData) {
                // read content of users file
                libData.read('users', fileData.email, (err, userData) => {
                    if (!err && userData) {

                        // check that cart exists
                        if (!userData.hasOwnProperty('cart') || userData.cart.length === 0) callback(404, { 'error': 'no items in cart to update' });
                        else {

                            let exists = false;

                            // check that item exists in cart
                            for (let i = 0; i < userData.cart.length; i++) {

                                // if match is found
                                if (itemID === userData.cart[i].id) {
                                    exists = true;

                                    // if updated quantity is not 0
                                    userData.cart[i].quantity = quantity;
                                    
                                    // if quality is zero, remove item
                                    if (quantity === 0) {
                                        userData.cart.splice(i, 1);
                                    }

                                    // update user cart
                                    libData.update('users', fileData.email, userData, err => {
                                        if (!err) callback(500, { 'error': 'could not update the users cart' });
                                    });
                                }
                            }

                            if (!exists) callback(404, { 'error': 'item does not exist in cart' });
                            else callback(200, userData.cart);
                        }
                    }
                    else callback(500, { 'error': 'could not find user' })
                })
            }
            else callback(401, { 'error': 'not authorised or badly formatted token' });
        });
    }
    else callback(400, { 'error': 'missing required fields' });

};

/*=============================
   Delete item from cart
=============================*/

cart.delete = (data, callback) => { 
    const { token } = data.headers;
    let { id: itemID } = data.payload;

     // check for itemID to add
     itemID = typeof (itemID) === 'number' && itemID < items.length && itemID >= 0 ? itemID : false;

     if (itemID >= 0) {
         // verify token
        tokens.verifyToken(token, (err, fileData) => {
            // if token id valid, read user file and delete item if it exists
            
            if (!err && fileData) {
                // read content of users file
                libData.read('users', fileData.email, (err, userData) => {
                    if (!err && userData) {
                        
                        let exists = false;

                        // check that item exists in cart
                        for (let i = 0; i < userData.cart.length; i++) {

                            // if match is found
                            if (itemID === userData.cart[i].id) {
                                exists = true;
                                userData.cart.splice(i, 1);

                                // update user cart
                                libData.update('users', fileData.email, userData, err => {
                                    if (!err) callback(500, { 'error': 'could not update the users cart' });
                                });
                            };
                        };

                        if (!exists) callback(404, { 'error': 'item does not exist in cart' });
                        else callback(200, userData.cart);

                    }
                    else callback(500, { 'error': 'could not find user' })
                })
            }
            else callback(401, { 'error': 'not authorised or badly formatted token' });
        });
     }
     else callback(401, {'error': 'missing required fields or invalid fields'})
};

// exports
module.exports = cart;