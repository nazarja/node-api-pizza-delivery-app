/**
*   Main Server file -starts http servers and listens for incoming requests
**/

const config = require('./config');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const url = require('url');
const router = require('./router');
const { StringDecoder } = require('string_decoder');
const helpers = require('../lib/helpers');

/*=============================
    Server Creation
=============================*/

const server = {};

// create http, https, server instances
server.httpServer = http.createServer((req, res) => server.unifiedServer(req, res));
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => server.unifiedServer(req, res));
server.httpsServerOptions = { key: fs.readFileSync(path.join(__dirname, '../https/key.pem')), cert: fs.readFileSync(path.join(__dirname, '../https/cert.pem')) };

/*=============================
    Server Request Logic
=============================*/

server.unifiedServer = (req, res) => {
    // get req parameters
    const parsedURL = url.parse(req.url, true);
    const parsedPath = parsedURL.pathname.replace(/^\/+|\/+$/g, '');
    const query = parsedURL.query;
    const method = req.method.toLowerCase();
    const headers = req.headers;

    // init data buffer w/decoder
    let decoder = new StringDecoder('utf-8');
    let buffer = '';

    // as data is is availible add to buffer
    req.on('data', data => buffer += decoder.write(data));

    // on request end
    req.on('end', () => {
        // close buffer
        buffer += decoder.end();

        // determine if req path is a valid route, set routeHandler, otherwise return 404
        const routehandler = typeof (router[parsedPath]) !== 'undefined'
            ? router[parsedPath]
            : router.notfound

        // construct request param object
        const requestData = {
            headers, method, path: parsedPath, query, payload: helpers.parseJsonToObject(buffer)
        };

        // handle route request
        routehandler(requestData, (statusCode, payload) => {
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;
            payload = typeof (payload) === 'object' ? payload : {};
            payload = JSON.stringify(payload);

            // end request and send back header and payload / response
            res.writeHead(statusCode);
            res.end(payload);
        });
    });
};

/*=============================
    Init && Export Server
=============================*/

// initialise server object and start listening on ports
server.init = () => {

    // http server listener
    server.httpServer.listen(
        config.port.http,
        () => console.log(`Server listening on: http://localhost:${config.port.http}/ | ${config.env}`)
    );

    // https server listener
    server.httpsServer.listen(
        config.port.https, 
        () => console.log(`Server listening on: https://localhost:${config.port.https}/ | ${config.env}`)
    );
};

module.exports = server;