'use strict';

const CronJob = require('cron').CronJob;
const L = require("winston");
const blacklist = require("./blacklist");
const cache = require("./cache");

module.exports = {
    set: function(frequency = "0 0 1 * * *") {
        new CronJob(frequency, () => {
            L.info("Downloading new blacklist DB.");
            blacklist.update().then();
            cache.set("dbVersion", new Date())
        }, null, true, 'Europe/Prague');
    }
};
