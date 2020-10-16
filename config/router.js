/**
*  Application Router Object
**/

const router = {
    ping: (data, cb) => cb(200),
    notfound: (data, cb) => cb(404),
};

module.exports = router;