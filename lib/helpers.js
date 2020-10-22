/**
*  Helpers file - contains various helper functions
**/

const querystring = require('querystring');
const crypto = require('crypto');
const config = require('../config/config');
const https = require('https');
const path = require('path');
const fs = require('fs');
const stripe = require('../config/stripe');
const mailgun = require('../config/mailgun');

const helpers = {};

// parse buffer string and return as an object
helpers.parseJsonToObject = string => {
    try { return JSON.parse(string); }
    catch (err) { return {}; }
};

// check input is a string and has deined length, check if required char is present
// return input string or false value
helpers.stringChecker = (string, length, char) => {
    let isValid = typeof (string) === 'string' && string.length >= length;
    if (char) isValid = string.includes(char);
    return isValid ? string : false;
};

// create password hash
helpers.hash = password => {
    return crypto
        .createHmac('sha256', config.secret)
        .update(password)
        .digest('hex');
};

// token creator
helpers.createTokenID = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    // token will be of length: 20
    for (let i = 0; i < 20; i++) {
        // pick a random char from chars
        const random = chars.charAt(Math.floor(Math.random() * chars.length));
        token += random;
    }

    return token;
};


helpers.charge = (total, stripeToken, callback) => {

    const payload = querystring.stringify({
        amount: total * 100,
        currency: 'eur',
        description: 'Pizza Order',
        source: stripeToken
    });

    const requestData = {
        protocol: 'https:',
        hostname: 'api.stripe.com',
        path: '/v1/charges',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + stripe.config.keys.secretKey,
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    const req = https.request(requestData, res => {
        const status = res.statusCode;

        res.on('data', data => {
            data = JSON.parse(data);

            if (data.error) callback(true, `Status code returned was: ${status}, error: ${err}`);
            else callback(false, `Status code returned was: ${status}`);
        });
    });

    req.on('error', err => cb("Request Error:" + err));
    req.write(payload);
    req.end();
};

// send email after successful payment
helpers.mail = (order, userData, callback) => {
    const { email } = userData;
    helpers.createEmail(order, userData, (err, message) => {
        if (!err && message) {

            const payload = querystring.stringify({
                from: mailgun.config.from,
                to: mailgun.config.to,
                subject: 'Pizza Order Confirmation | Receipt',
                html: message
            });

            const requestData = {
                protocol: 'https:',
                hostname: 'api.mailgun.net',
                method: 'POST',
                path: `/v3/${mailgun.config.domain}/messages`,
                auth: `api:${mailgun.config.apiKey}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(payload),
                    "Authorization": 'Basic ' + Buffer.from('api' + ':' + mailgun.config.apiKey).toString('base64'),
                }
            };

            const req = https.request(requestData, res => {
                const status = res.statusCode;
                if (status === 200 || status === 201) callback(false);
                else callback(500, {'error': 'error sending email'});
            });

            req.on('error', err => console.log("Request Error:" + err));
            req.write(payload);
            req.end();
        }
        else console.log('error')
    });
};

// replaces placeholder text in html template file with order data
helpers.createEmail = (order, userData, callback) => {
    const filepath = path.join(__dirname, '../templates/email.html');

    fs.readFile(filepath, 'utf8', (err, fileData) => {
        if (err) callback(500, err);
        else {
            const { name, address } = userData;
            let items = '';

            order.items.forEach(item => {
                items += `<li>${item.name} | cost: ${item.price} | quantity: ${item.quantity}</li></br>`;
            });

            fileData = fileData.replace('{{ name }}', name);
            fileData = fileData.replace('{{ address }}', address);
            fileData = fileData.replace('{{ items }}', items);
            fileData = fileData.replace('{{ total }}', order.total);

            callback(false, fileData);
        };
    });
};

// gets html template, reads and returns it
helpers.getTemplate = (template, callback) => {
    template = helpers.stringChecker(template, 1);
    if (template) {
        const dir = path.join(__dirname, '../templates/');

        // read template file and pass back to caller
        fs.readFile(`${dir}/${template}.html`, 'utf8', (err, str) => {
            if (!err && str) callback(false, str);
            else callback('No template could be found');
        })
    }
    else callback('A valid template was not specified');
};


module.exports = helpers;