/**
*  Main Entry file, calls and inits the server
**/

const server = require('./server/server');
const workers = require('./lib/workers');

const app = {};

//  auto start application
app.init =() => {
    server.init();
    workers.init();
}
app.init();
