const server = require('./config/server');

const app = {};

app.init =() => {
    server.init();
}

app.init();
