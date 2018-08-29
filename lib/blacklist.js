'use strict';

const path = require('path');
const P = require('bluebird');
const R = require('ramda');
const fs = require('fs');
const request = require('request');
const unzip = require('unzipper');
const LineByLineReader = require('line-by-line');
const redisQueries = require("./redis/redisQueries");

const FILE_URL = "https://myip.ms/files/blacklist/general/full_blacklist_database.zip";
const ZIP_FILE_NAME = path.resolve(__dirname, "database.zip");
const TXT_FILE_NAME = path.resolve(__dirname, "full_blacklist_database.txt");

module.exports = {
    update: async () =>
        await P.resolve(true)
            .then(download)
            .then(unzipFile)
            .then(() => saveFileToRedis(TXT_FILE_NAME))
            .then(removeFiles),

    get: ip => redisQueries.isIpBlacklisted(ip),

    count: () => redisQueries.countBlacklistedIps()
};

function download() {
    const stream = request(FILE_URL);

    stream.pipe(fs.createWriteStream(ZIP_FILE_NAME));

    return new P((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
    });
}

function unzipFile() {
    const stream = fs.createReadStream(ZIP_FILE_NAME);

    stream.pipe(unzip.Extract({path: __dirname}));

    return new P((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
    });
}

function removeFiles() {
    fs.unlinkSync(ZIP_FILE_NAME);
    fs.unlinkSync(TXT_FILE_NAME);
}

async function saveFileToRedis(file) {
    await redisQueries.flushBlacklistedIps();

    const lr = new LineByLineReader(file, {skipEmptyLines: true});

    return new P((resolve, reject) => {
        lr.on('end', resolve);

        lr.on('error', reject);

        lr.on('line', line => {
                const ip = getIpFromLine(line);
                if (ip) redisQueries.setBlacklistedIp(ip)
            }
        );
    });
}

function getIpFromLine(line) {
    return (line[0] === "#")
        ? false
        : R.pipe(R.split(' '), R.head, R.trim)(line);
}