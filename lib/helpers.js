/**
*  Helpers file - contains various helper functions
**/

const libData = require('./data');
const crypto = require('crypto');
const config = require('../config/config');

const helpers = {};

// parse buffer string and return as an object
helpers.parseJsonToObject = string => {
    try { return JSON.parse(string); }
    catch (err) { return {}; }
};

// check input is a string and has deined length, check if required char is present
// return input string or false value
helpers.stringChecker = (string, length, char) => {
    let isValid = typeof (string) === 'string' && string.length >= length;
    if (char) isValid = string.includes(char);
    return isValid ? string : false;
};

// create password hash
helpers.hash = password => {
    return crypto
        .createHmac('sha256', config.secret)
        .update(password)
        .digest('hex');
};

// token creator
helpers.createTokenID = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    // token will be of length: 20
    for (let i = 0; i < 20; i++) {
        // pick a random char from chars
        const random = chars.charAt(Math.floor(Math.random() * chars.length));
        token += random;
    }

    return token;
};



module.exports = helpers;