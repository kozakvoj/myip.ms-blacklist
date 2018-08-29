'use strict';

const L = require("winston");

const path = require('path');
require('dotenv').config({path: `${path.resolve(__dirname, "./.env")}`});

const Koa = require("koa");
const app = new Koa();

const cron = require("./lib/cron");
cron.set();

const router = require("./lib/routes");

async function conditionalUpdate() {
    const blacklist = require("./lib/blacklist");
    if (await blacklist.count()) {
        blacklist.update();
    }
}

conditionalUpdate().then();

L.info(`App listening on port ${process.env.APP_PORT}`);
app
    .use(router.routes())
    .listen(process.env.APP_PORT);