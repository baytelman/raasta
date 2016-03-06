"use strict";

var pg = require('pg');
var connection = "postgresql://postgres:@localhost:5432/ratings?param=value";

var ratingsDao = {};

module.exports = {
    getCurrentTime: function(timeCallback) {
        pg.connect(connection, function(err, client, done) {
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
    insertRating: function(token, rating, key1, key2, key3, insertCallback) {
        const RATING_INSERT = 'INSERT INTO Ratings (token, rating, key1, key2, key3) VALUES ($1, $2, $3, $4, $5)';

        pg.connect(connection, function(err, client, done) {
            if (err) throw err;

            client.query(RATING_INSERT, [token, rating, key1, key2, key3], function(err, result) {
                done();
                if (err) {
                    return console.error('error running query', err);
                };
                insertCallback(true);
            });
        });
    }
};
