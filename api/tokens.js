/**
*  Tokens file - CRUD routes - Web tokens for user auth
*  Some Token existence checks should be performed in file operation and auth functions
**/

const libData = require('../lib/data');
const helpers = require('../lib/helpers');

const tokens = {};

/*=============================
    Get token
=============================*/

tokens.get = (data, callback) => {
    // check payload contains token id and is valid
    if (helpers.stringChecker(data.headers.token), 20) {

        // get the token file data
        libData.read('tokens', data.headers.token, (err, fileData) => {
            console.log(err, fileData)
            // if it exists extend the expiry
            if (!err && fileData) callback(200, fileData);
            else callback(404);
        });
    };
};

/*=============================
    Create token
=============================*/

// create token json file
// user & password checks already performed in auth/login
tokens.post = (data, callback) => {
    const token = {
        id: helpers.createTokenID(),
        expiry: Date.now() + (1000 * 60 * 60 * 24),
        email: data.email
    };

    // create token file and callback to auth login
    libData.create('tokens', token.id, token, err => {
        if (!err) callback(false, token);
        else callback(500, { 'error': 'could not create new token' });
    });
};

/*=============================
    Update token
=============================*/

// token should be extended by 24hrs
tokens.put = (data, callback) => {

    // check payload contains token id and is valid
    if (helpers.stringChecker(data.headers.token), 20) {

        // get the token file data
        libData.read('tokens', data.headers.token, (err, fileData) => {

            // if it exists extend the expiry
            if (!err && fileData) {
                fileData.expiry = Date.now() + (1000 * 60 * 60 * 24);

                // try update the token file    
                libData.update('tokens', data.headers.token, fileData, err => {

                    // no error value indicates successful update
                    if (!err) callback(false);
                    else callback(500, { 'error': 'could not update token' })
                });
            }
            else callback(500, { 'error': 'error updating token file' });
        });
    }
    else callback(400, { 'error': 'missing required or invalid field' })
};

/*=============================
    Delete token
=============================*/

tokens.delete = (data, callback) => {

    // check payload contains token id and is valid
    if (helpers.stringChecker(data.headers.token), 20) {

        // try delete the token file
        libData.delete('tokens', data.headers.token, err => {

            // no error value indicates successful deletion
            if (!err) callback(false);
            else callback(500, { 'error': 'could not delete token' })
        });
    }
    else callback(400, { 'error': 'missing required or invalid field' })
};

/*=============================
    Verify token
=============================*/

tokens.verifyToken = (tokenID, email, callback) => {
    
    // find and read file content
    libData.read('tokens', tokenID, (err, fileData) => {
        if (!err && fileData) {

            // check that tokens email matches users email and token is not expired
            if (fileData.email === email && fileData.expiry > Date.now()) callback(true);
            else callback(false);
        }
        else callback(false);
    });
};

// exports
module.exports = tokens;