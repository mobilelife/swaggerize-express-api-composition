var request = require('supertest');
var server = require('./server');
require('../chai');

var host = 'localhost:4000';
var scheme = 'http';
var basePath = '/';

describe('loading express', function () {
    var app;

    afterEach(function () {
        app.close();
    });

    it('responds with unauthorized to /private-api', function (done) {
        app = server(false,'private','public');
        request(app)
            .get('/private-api')
            .expect(401, done);
    });

    it('responds with ok to /private-api with api-key', function (done) {
        app = server(false,'private','public');
        request(app)
            .get('/private-api?api_key=private')
            .expect(200, function(err,res){
                try {
                    //assert public api contains both /pets and /pets/{id} paths.
                    assert.include(Object.keys(res.body.paths), '/pets', "/pets path is included");
                    assert.include(Object.keys(res.body.paths), '/pets/{id}', "/pets/{id} path is included");

                    //assert contains only get and post of privateApi of /pets
                    assert.include(Object.keys(res.body.paths['/pets']), 'get', "/pets path get operation is included");
                    assert.include(Object.keys(res.body.paths['/pets']), 'post', "/pets path post operation is included");

                    //assert contains get and delete of privateApi of /pets/{id}
                    assert.include(Object.keys(res.body.paths['/pets/{id}']), 'get', "/pets/{id} path get operation is included");
                    assert.include(Object.keys(res.body.paths['/pets/{id}']), 'delete', "/pets/{id} path delete operation is included");

                    //assert host,scheme and basePath
                    assert.equal(res.body.host, host, "host is to match input");
                    assert.include(res.body.schemes, scheme, "scheme is to match input");
                    assert.equal(res.body.basePath, basePath, "basePath is to match input");
                    done();
                }catch(e){
                    done(e);
                }

            });
    });

    it('responds with ok to /private-api without api-key', function (done) {
        app = server(false);
        request(app)
            .get('/private-api')
            .expect(200, done);
    });

    it('responds with unauthorized to /public-api', function (done) {
        app = server(false,'private','public');
        request(app)
            .get('/public-api')
            .expect(401, done);
    });

    it('responds with not found to /swagger-ui', function (done) {
        app = server(false,'private','public');
        request(app)
            .get('/swagger-ui')
            .expect(404, done);
    });
    it('responds with ok to /swagger-ui', function (done) {
        app = server(true,'private','public');
        request(app)
            .get('/swagger-ui')
            .expect(303, done);
    });

    it('responds with ok to /public-api without api-key', function (done) {
        app = server(false,'private');
        request(app)
            .get('/public-api')
            .expect(200, done);
    });

    it('responds with ok to /pets', function (done) {
        app = server(false,'private','public');
        request(app)
            .get('/pets')
            .expect(200, done);
    });


    it('responds with ok on post to /pets', function (done) {
        app = server(false,'private','public');
        request(app)
            .post('/pets')
            .send({name: 'new test pet'})
            .expect(200, done);
    });


    it('responds with ok on get to pets/{id}', function (done) {
        app = server(false,'private','public');
        request(app)
            .get('/pets/1')
            .expect(200, done);
    });

    it('responds with ok on delete to pets/{id}', function (done) {
        app = server(false,'private','public');
        request(app)
            .delete('/pets/1')
            .expect(204, done);
    });

    it('responds with ok to /public-api with api-key', function(done) {
        app = server(false,'private','public');
        request(app)
            .get('/public-api?api_key=public')
            .expect(200, function(err,res){
                try {
                    //assert public api contains both /pets and /pets/{id} paths.
                    assert.include(Object.keys(res.body.paths), '/pets', "/pets path is included");
                    assert.include(Object.keys(res.body.paths), '/pets/{id}', "/pets/{id} path is included");

                    //assert contains only get publicApi of /pets
                    assert.include(Object.keys(res.body.paths['/pets']), 'get', "/pets path get operation is included");
                    assert.notInclude(Object.keys(res.body.paths['/pets']), 'post', "/pets path post operation is included");

                    //assert contains only get publicApi of /pets/{id}
                    assert.include(Object.keys(res.body.paths['/pets/{id}']), 'get', "/pets/{id} path get operation is included");
                    assert.notInclude(Object.keys(res.body.paths['/pets/{id}']), 'delete', "/pets/{id} path delete operation is included");

                    //assert host,scheme and basePath
                    assert.equal(res.body.host, host, "host is to match input");
                    assert.include(res.body.schemes, scheme, "scheme is to match input");
                    assert.equal(res.body.basePath, basePath, "basePath is to match input");
                    done();
                }catch(e){
                    done(e);
                }

            });
    });

    it('404 everything else', function(done) {
        app = server(true,'private','public');
        request(app)
            .get('/foo/bar')
            .expect(404, done);
    });

    it('responds with not found on put to /pets', function (done) {
        app = server(false,'private','public');
        request(app)
            .put('/pets')
            .expect(404, done);
    });
});



