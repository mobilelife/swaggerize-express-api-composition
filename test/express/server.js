var express = require('express');
var swaggerUtil = require('../../index.js');
var path = require('path');
var bodyParser = require('body-parser');


module.exports= function(swaggerUi, privateApiKey, publicApiKey) {
    var app = express();
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(swaggerUtil({
        paths: ['./test/swagger/petstore/paths/pets.json',
            './test/swagger/petstore/paths/pets/{id}.json'],
        host: 'localhost:4000',
        schemes: ['http'],
        basePath: '/',
        definitions: ['./test/swagger/petstore/definitions/pet.json',
        './test/swagger/petstore/definitions/newPet.json',
        './test/swagger/petstore/definitions/error.json'],
        spec:'./test/swagger/petstore/swagger.json',
        swaggerUI: swaggerUi,
        privateDocs: '/private-api',
        publicDocs: '/public-api',
        publicTag: 'public',
        handlers: './test/express/handlers',
        privateDocsApiKey: privateApiKey,
        publicDocsApiKey: publicApiKey,
        swaggerApiUrl: 'http://localhost:4000'
    }));


    return app.listen(4000, function () {
        console.log('server listens on port 4000\n');
    });
}