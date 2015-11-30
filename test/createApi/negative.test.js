require('../chai');
var createSwaggerApi =  require('../../lib/createSwaggerApi');

describe('Test that errors are reported' , function () {

    it('test that only version 2.0 is supported', function (done) {
        var host = 'localhost';
        var scheme = 'http';
        var basePath = '/';
        var failed = false;
        try {
             createSwaggerApi(
                host,
                scheme,
                basePath,
                {swagger: "1.0"},
                ['./test/swagger/petstore/paths/pets.json',
                    './test/swagger/petstore/paths/pets/{id}.json'],
                ['./test/swagger/petstore/definitions/pet.json',
                    './test/swagger/petstore/definitions/newPet.json',
                    './test/swagger/petstore/definitions/error.json'],
                "public");

        }catch(e){
            done();
            failed=true;
        }
        if(!failed)
        assert.fail('OK', 'Failed as version is 1.0', 'only swagger version 2.0 is supported');
    });

    it('multiple identical paths are caught', function (done) {
        var host = 'localhost';
        var scheme = 'http';
        var basePath = '/';
        var failed = false;
        try {
            createSwaggerApi(
                host,
                scheme,
                basePath,
                {swagger: "2.0"},
                ['./test/swagger/petstore/paths/pets.json',
                 './test/swagger/petstore/paths/pets.json'],
                ['./test/swagger/petstore/definitions/pet.json',
                    './test/swagger/petstore/definitions/newPet.json',
                    './test/swagger/petstore/definitions/error.json'],
                "public");

        }catch(e){
            done();
            failed=true;
        }
        if(!failed)
            assert.fail('OK', 'failed because /pets is defined multiple times', 'only one /pets endPoints must be defined across all files');
    });

    it('multiple identical definitions are caught', function (done) {
        var host = 'localhost';
        var scheme = 'http';
        var basePath = '/';
        var failed = false;
        try {
            createSwaggerApi(
                host,
                scheme,
                basePath,
                {swagger: "2.0"},
                ['./test/swagger/petstore/paths/pets.json'],
                ['./test/swagger/petstore/definitions/pet.json',
                    './test/swagger/petstore/definitions/pet.json',
                    './test/swagger/petstore/definitions/newPet.json',
                    './test/swagger/petstore/definitions/error.json'],
                "public");

        }catch(e){
            done();
            failed=true;
        }
        if(!failed)
            assert.fail('OK', 'failed because pet definition is defined multiple times', 'only one pet definition must be defined across all files');
    });

});