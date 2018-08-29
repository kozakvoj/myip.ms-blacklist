'use strict';

const path = require('path');
require('dotenv').config({path: `${path.resolve(__dirname, "./.env")}`});

const CronJob = require('cron').CronJob;
const Koa = require("koa");
const app = new Koa();
const blacklist = require("./lib/blacklist");
const L = require("winston");


new CronJob('0 0 1 * * *', () => {
    L.info("Downloading new blacklist DB.");
    blacklist.run().then();
}, null, true, 'Europe/Prague');

app.use(async ctx => {
    ctx.body = 'Hello World';
});

app.listen(3000);