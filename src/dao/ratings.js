"use strict";

var config = require('../config.js');
var pg = require('pg');

var ratingsDao = {};

module.exports = {
    getCurrentTime: function(timeCallback) {
        pg.connect(config.db.url, function(err, client, done) {
            if (err) throw err;

            client.query('SELECT NOW() as now', function(err, result) {
                done();
                if (err) {
                    return console.error('error running query', err);
                };
                timeCallback(result.rows[0].now);
            });
        });
    },
    insertRating: function(token, user, rating, key1, key2, key3, insertCallback) {
        const RATING_INSERT = 'INSERT INTO ratings (token, userId, rating, key1, key2, key3) \
        VALUES ($1, $2, $3, $4, $5, $6) \
        RETURNING id';

        pg.connect(config.db.url, function(err, client, done) {
            if (err) throw err;

            client.query(RATING_INSERT, [token, user, rating, key1, key2, key3], function(err, result) {
                done();
                if (err) {
                    return console.error('error running query', err);
                };
                insertCallback(result.rows[0].id);
            });
        });
    },
    selectStats: function(token, user, key1, key2, key3, statsCallback) {
        const RATING_STATS = 'SELECT \
        $2::bigint as user, \
        $3::bigint as key1, \
        $4::bigint as key2, \
        $5::bigint as key3, \
        avg(rating) as average \
        FROM \
        ratings \
        WHERE \
        token = $1 AND \
        ($2::bigint IS NULL OR $2::bigint = userId) AND \
        ($3::bigint IS NULL OR $3::bigint = key1) AND \
        ($4::bigint IS NULL OR $4::bigint = key2) AND \
        ($5::bigint IS NULL OR $5::bigint = key3) \
        ';

        pg.connect(config.db.url, function(err, client, done) {
            if (err) throw err;

            client.query(RATING_STATS, [token, user, key1, key2, key3], function(err, result) {
                done();
                if (err) {
                    return console.error('error running query', err);
                };
                console.log(result.rows);
                statsCallback(result.rows[0]);
            });
        });
    },
};
