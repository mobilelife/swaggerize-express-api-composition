require('../chai');
var createSwaggerApi =  require('../../lib/createSwaggerApi');


describe('Test the composition pet-store api' , function () {

    it('test that the pet-store is composed correctly', function (done) {

        var host = 'localhost';
        var scheme = 'http';
        var basePath = '/';


        var apis = createSwaggerApi(
            host,
            scheme,
            basePath,
            './test/swagger/petstore/swagger.json',
            ['./test/swagger/petstore/paths/pets.json',
                './test/swagger/petstore/paths/pets/{id}.json'],
            ['./test/swagger/petstore/definitions/pet.json',
                './test/swagger/petstore/definitions/newPet.json',
                './test/swagger/petstore/definitions/error.json'],
            "public");

        //assert private api contains both /pets and /pets/{id} paths.
        assert.include(Object.keys(apis.privateApi.paths), '/pets', "/pets path is included");
        assert.include(Object.keys(apis.privateApi.paths), '/pets/{id}', "/pets/{id} path is included");

        //assert public api contains both /pets and /pets/{id} paths.
        assert.include(Object.keys(apis.publicApi.paths), '/pets', "/pets path is included");
        assert.include(Object.keys(apis.publicApi.paths), '/pets/{id}', "/pets/{id} path is included");

        //assert both get and post is included in privateApi of /pets
        assert.include(Object.keys(apis.privateApi.paths['/pets']), 'get', "/pets path get operation is included");
        assert.include(Object.keys(apis.privateApi.paths['/pets']), 'post', "/pets path post operation is included");

        //assert both get and delete is included in privateApi of /pets/{id}
        assert.include(Object.keys(apis.privateApi.paths['/pets/{id}']), 'get', "/pets/{id} path get operation is included");
        assert.include(Object.keys(apis.privateApi.paths['/pets/{id}']), 'delete', "/pets/{id} path delete operation is included");


        //assert contains only get publicApi of /pets
        assert.include(Object.keys(apis.publicApi.paths['/pets']), 'get', "/pets path get operation is included");
        assert.notInclude(Object.keys(apis.publicApi.paths['/pets']), 'post', "/pets path post operation is included");

        //assert contains only get publicApi of /pets/{id}
        assert.include(Object.keys(apis.publicApi.paths['/pets/{id}']), 'get', "/pets/{id} path get operation is included");
        assert.notInclude(Object.keys(apis.publicApi.paths['/pets/{id}']), 'delete', "/pets/{id} path delete operation is included");

        //assert host,scheme and basePath
        assert.equal(apis.privateApi.host,host, "host is to match input");
        assert.equal(apis.publicApi.host,host, "host is to match input");
        assert.include(apis.privateApi.schemes,scheme, "scheme is to match input");
        assert.include(apis.publicApi.schemes,scheme, "scheme is to match input");
        assert.equal(apis.privateApi.basePath,basePath, "basePath is to match input");
        assert.equal(apis.publicApi.basePath,basePath, "basePath is to match input");

        done();
    });
});