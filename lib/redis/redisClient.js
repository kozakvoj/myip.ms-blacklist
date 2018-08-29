'use strict';

const L = require('winston');
const R = require('ramda');
const P = require('bluebird');

const redis = require('promise-redis')(function (resolver) {
    return new P(resolver);
});

const clientPool = [];

module.exports = {
    client: () => {
        const client = redis.createClient();
        clientPool.push(client);

        client.on("error", err => L.error("Connection to Redis failed", err));

        return client;
    },
    end: () => R.forEach(client => client.quit(), clientPool)
};