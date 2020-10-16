const helpers = {};

helpers.parseJsonToBuffer = buffer => {
    try { return JSON.parse(str); }
    catch (err) { return {}; }
}

module.exports = helpers;