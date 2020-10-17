/* 
* Background Workers: Will clean up data directory files that are no longer valid
*/

const libData = require('./data');

const workers = {};

// delete any tokens older than 24hrs
workers.cleanTokens = () => {

    // get array of filenames
    libData.list('tokens', (err, files) => {

        if (!err && files) {

            // loop over files
            for (let file of files) {
                libData.read(`../.data/tokens`, file, (err, fileData) => {
                    if (!err && fileData) {
                        // if file is older than 24hrs - delete it
                        if (fileData.expiry < Date.now() - (1000 * 60 * 60 * 24)) {
                            libData.delete('tokens', file, err => {
                                // true err indicates failure
                                if (err) console.error('error: could not delete token during cleanup')
                            });
                        };
                    }
                    else console.error('error deleting token during cleanup');
                });
            }
        }
        else console.error('error getting files for deletion');
    })
};

// set 24hr clean up loop
workers.loop = () => {
    setInterval(() => {
        workers.cleanTokens();
    }, (1000 * 60 * 60 * 24))
};

// init workers functions
workers.init = () => {
    workers.loop();
    workers.cleanTokens();
};

module.exports = workers;