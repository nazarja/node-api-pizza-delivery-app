/**
*  Main Entry file, calls and inits the server
**/

const server = require('./config/server');

const app = {};

//  auto start application
app.init =() => {
    server.init();
}
app.init();
