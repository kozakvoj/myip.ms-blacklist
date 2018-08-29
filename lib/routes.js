'use strict';

const Router = require('koa-router');
const router = new Router();

const pjson = require('./../package.json');
const blacklist = require("./blacklist");

const cache = require("./cache");

router.get("/", async ctx => {
    ctx.body = `
    App version: ${pjson.version}
    DB version: ${cache.get("dbVersion")}
    `;
});

router.get("/ip/:ip", async ctx => {
    ctx.body = await blacklist.get(ctx.params.ip);
});

module.exports = router;