var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../src/app');
var should = chai.should();

/* Check we are NOT going to kill the main DB */
var config = require('../src/config');
if (config.db.url.indexOf('test') <= 0 && config.db.url.indexOf('travis') <= 0) {
    throw new Error("Tests can ONLY run with test db (ENV should be 'test')");
}

const TOKEN = "test_token_" + new Date().getTime();
const KEY_1 = 100;
const KEY_2 = 200;
const RATE_GOOD = 5;
const RATE_OK = 3;
const RATE_BAD = 1;
const USER_ID = 9;

var tokenCount = 0;
var currentToken = null;

chai.use(chaiHttp);
describe('Ratings', function() {
    beforeEach(function(done){
        currentToken = TOKEN + (++tokenCount);
        done();
    });
    it('should insert a SINGLE rating on /ratings PUT', function(done) {
        chai.request(server)
        .put('/api/v1/ratings?token=' + currentToken + '&user=' + USER_ID + '&rating=' + RATE_GOOD + '&key1=' + KEY_1)
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            done();
        });
    });
    it('puting a GOOD RATING will provide GOOD RATING average', function(done) {
        chai.request(server)
        .put('/api/v1/ratings?token=' + currentToken + '&user=' + USER_ID + '&rating=' + RATE_GOOD + '&key1=' + KEY_1)
        .end(function(err, res){
            chai.request(server)
            .put('/api/v1/ratings?token=' + currentToken + '&user=' + USER_ID + '&rating=' + RATE_OK + '&key1=' + KEY_1)
            .end(function(err, res){
                chai.request(server)
                .get('/api/v1/ratings?token=' + currentToken + '&key1=' + KEY_1)
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('stats');
                    res.body.stats.should.have.property('average');
                    res.body.stats.average.should.equal((RATE_GOOD + RATE_OK)/2.0);
                    done();
                });
            });
        });
    });
    it('puting a RATINGS on the right type of key', function(done) {
        chai.request(server)
        .put('/api/v1/ratings?token=' + currentToken + '&user=' + USER_ID + '&rating=' + RATE_GOOD + '&key1=' + KEY_1)
        .end(function(err, res){
            chai.request(server)
            .put('/api/v1/ratings?token=' + currentToken + '&user=' + USER_ID + '&rating=' + RATE_BAD + '&key2=' + KEY_2)
            .end(function(err, res){
                chai.request(server)
                .put('/api/v1/ratings?token=' + currentToken + '&user=' + USER_ID + '&rating=' + RATE_OK + '&key1=' + KEY_1 + '&key2=' + KEY_2)
                .end(function(err, res){
                    /* KEY 1 = 4 */
                    chai.request(server)
                    .get('/api/v1/ratings?token=' + currentToken + '&key1=' + KEY_1)
                    .end(function(err, res) {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('object');
                        res.body.should.have.property('stats');
                        res.body.stats.should.have.property('average');
                        res.body.stats.average.should.equal((RATE_GOOD + RATE_OK)/2.0);

                        /* KEY 2 = 2 */
                        chai.request(server)
                        .get('/api/v1/ratings?token=' + currentToken + '&key2=' + KEY_2)
                        .end(function(err, res) {
                            res.should.have.status(200);
                            res.should.be.json;
                            res.body.should.be.a('object');
                            res.body.should.have.property('stats');
                            res.body.stats.should.have.property('average');
                            res.body.stats.average.should.equal((RATE_BAD + RATE_OK)/2.0);

                            done();
                        });
                    });
                });
            });
        });
    });
});
