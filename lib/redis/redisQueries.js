'use strict';

const client = new require('./redisClient').client();
client.select(process.env.REDIS_DB);

module.exports = {
    setBlacklistedIp: ip => client.set(ip, true),
    isIpBlacklisted: ip => client.get(ip).then(res => !!res),
    flushBlacklistedIps: () => client.flushdb(),
};
