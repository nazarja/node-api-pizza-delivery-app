
const helpers = require('../lib/helpers');

const pages = {};

pages.index = (data, callback) => {

    // only allow get request
    if (data.method === 'get') {

        // get template
        helpers.getTemplate('index', (err, template) => {
            // if template exists return it
            if (!err && template) {
                callback(200, template, 'html')
            }

            // otherwise send error
            else  callback(500, undefined, 'html');
        });
    }
    else callback(405, undefined, 'html');
};

module.exports = pages;