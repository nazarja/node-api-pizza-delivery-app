/**
*   Server Config file to determine environment and set config vars
**/

const environments = {};

// staging config object
environments.staging = {
    port: {
        http: 3000,
        https: 3001
    },
    env: 'staging',
    secret: 'youwillneverguess'
};

// production config object
environments.production = {
    port: {
        http: 5000,
        https: 5001
    },
    env: 'production',
    secret: 'youwillneverguess'
};

// determine if server started with env variable
const currentEnvironment = typeof (process.env.NODE_ENV) === 'string'
    ? process.env.NODE_ENV.toLowerCase()
    : '';

// set environment if specified, otherwise return staging
const exportedEnvironment = typeof (environments[currentEnvironment]) === 'object'
    ? environments[currentEnvironment]
    : environments.staging;


module.exports = exportedEnvironment;