/**
*  Menu file - Get list of menu items to return to user
**/

const items = require('../.data/menu/items.json');
const tokens = require('./tokens');

const menu = {};

// methods
menu.get = (data, callback) => { 
    // check user is logged in to get menu
    const { token } = data.headers;

    // if token is valid send back menu items
    tokens.verifyToken(token, err => {
        if (!err)  callback(200, items);
        else callback(401, {'error': 'invalid token or token has expired'});
    });
};

// exports
module.exports = menu;