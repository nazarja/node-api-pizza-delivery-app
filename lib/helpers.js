/**
*  Helpers file - contains various helper functions
**/

const helpers = {};

// parse buffer string and return as an object
helpers.parseJsonToBuffer = buffer => {
    try { return JSON.parse(str); }
    catch (err) { return {}; }
};

module.exports = helpers;