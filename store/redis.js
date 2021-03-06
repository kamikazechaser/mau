/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 GochoMugo <mugo@forfuture.co.ke>
 * Copyright (c) 2017 Forfuture LLC <we@forfuture.co.ke>
 */


// installed modules
const redis = require("redis");


// own modules
const SessionStore = require("./base");


class RedisSessionStore extends SessionStore {
    /**
     * @constructor
     * @param  {Object} [options] Options passed to 'redis.createClient()' (if `options.client` is *not* provided)
     * @param  {RedisClient} [options.client] An existing client
     * @see https://github.com/NodeRedis/node_redis#rediscreateclient
     */
    constructor(options={}) {
        super();
        if (options.client) {
            this.client = options.client;
        } else {
            this.client = redis.createClient(options);
            this.client.on("error", (error) => this.emit("error", error));
        }
    }
    get(sid, done) {
        return this.client.get(sid, (error, data) => {
            if (error) {
                return done(error);
            }
            if (!data) {
                return done(null, null);
            }
            let session;
            try {
                session = JSON.parse(data);
            } catch(ex) {
                return done(ex);
            }
            return done(null, session);
        });
    }
    put(sid, session, options, done) {
        const data = JSON.stringify(session);
        const args = [sid, data];
        if (options.ttl !== +Infinity) {
            args.push("PX", options.ttl);
        }
        return this.client.set(args, done);
    }
    del(sid, done) {
        return this.client.del(sid, (error, removed) => {
            return done(error, removed === 1);
        });
    }
}


exports = module.exports = RedisSessionStore;
