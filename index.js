var express = require('express');
var swaggerize = require('swaggerize-express');
var is = require('core-util-is');
var assert = require('assert');
var createSwaggerApi = require('./lib/createSwaggerApi');
var path = require('path');
var extend = require('util')._extend;

/**
 * Takes a swagger 2.0 specification and creates and express server using swaggerize-express,
 * this is a decoration to allow you to split up specification file into multiple paths and type definition files.
 * handling swaggerUI and api docs endpoint for both the full api and a subset of the api, a public api.
 *
 * @param options object of options.
 * @param options.spec the swagger 2.0 specification file, without paths and definitions, no host, schemes an basePaths.
 * to allow for composition of paths and definitions from separate files, and to configure host information on deployment.
 * @param options.host the host address used in the swagger file, and by the swagger ui to call the services,
 * should point to the url where the service is deployed.
 * @param options.schemes should be configured to the protocol schemes supported on the deployed url
 * @param options.basePath should be configured to the base path of the host where the service is deployed.
 * @param options.mountPath internal base path used by express swaggerize to build path elements.
 * @param options.handlers path to where the express swaggerize handlers are defined.
 * if the service is deployed in a docker file, the internal basePath might be '/'
 * whereas the external may be deployed at companyurl.com/serviceBasePath, for example because of dns cname.
 * @param options.paths array of swagger 2.0 path definitions, it is not allowed to have two identical paths.
 * @param options.definitions array of swagger 2.0 type definitions, it is not allowed to have two types with the same name
 * @param options.publicTag if defined a public api is created, containing only the path operations that are tagged with the publicTag
 * @param options.swaggerUI boolean if true the swaggerUI is exposed on the service a http://host/basePath/swagger-ui
 * @param options.swaggerApiUrl when swaggerUI is on, the swaggerUI is expecting the docs file to be pointing to this url.
 * @param options.privateDocs the place where the private specs file can be downloaded scheme://host/basePath/privateDocs,
 * if undefined privateDocs=api-docs
 * @param options.publicDocs if defined a public api is also deployed scheme://host/basePath/publicDocs.
 * A public api is a subset of the full api, that can be used to give to external business partners as documentation of subset of the api.
 * @param options.privateDocsApiKey api key used to protect the private api docs.
 * @param options.publicDocsApiKey api key used to protect the public api docs.
 *
 * @returns {*}
 */
module.exports = function (options) {

    assert.ok(is.isObject(options), "Options must be an object");
    assert.ok(is.isString(options.host), "Options.host, string address to where the api is hosted");
    assert.ok(is.isArray(options.schemes) || is.isString(options.schemes),"options.schemes a protocol (http, https,ws,wss) for accessing the api must be defined.");
    assert.ok(is.isString(options.basePath) || is.isUndefined(options.basePath) , "Options.basePath, path to where the api is served on the host");
    assert.ok(is.isString(options.mountPath) || is.isUndefined(options.mountPath) , "Options.mountPath, path to where swaggerize mounths");
    assert.ok(is.isArray(options.paths), "Options.paths must be an array");
    assert.ok(is.isArray(options.definitions), "Options.paths must be an array");
    assert.ok(options.paths.length > 0, "There must be at least one path specification");
    assert.ok(is.isObject(options.spec) || is.isString(options.spec),'options.spec definition must be object or string, containing swagger defintion of info, contact, without paths and definitions');
    assert.ok(is.isString(options.privateDocs) || is.isUndefined(options.privateDocs), "Options.privateDocs must be a string or undefined");
    assert.ok(is.isString(options.publicDocs) || is.isUndefined(options.publicDocs), "Options.publicDocs must be a string or undefined");
    assert.ok(is.isBoolean(options.swaggerUI) || is.isUndefined(options.swaggerUI), "Options.swaggerUI must be a boolean or undefined");
    assert.ok(is.isString(options.swaggerApiUrl) || is.isUndefined(options.swaggerApiUrl), "Options.swaggerApiUrl must be a string or undefined");
    assert.ok(is.isString(options.handlers), "Options.handlers must be a path-string");
    assert.ok(is.isString(options.publicTag) || is.isUndefined(options.publicTag), "Options.handlers must be a path-string");
    assert.ok(is.isString(options.privateDocsApiKey) || is.isUndefined(options.privateDocsApiKey), "Options.privateDocsApiKey must be string or undefined");
    assert.ok(is.isString(options.publicDocsApiKey) || is.isUndefined(options.publicDocsApiKey), "Options.publicDocsApiKey must be string or undefined");


    var publicTag = (options.publicTag || 'public').toLowerCase();

    var schemes = is.isString(options.schemes) ? [options.schemes] : options.schemes;
    var apis = createSwaggerApi(options.host,schemes,options.basePath,options.spec,options.paths,options.definitions, publicTag);


    var app = express();
    if (options.swaggerUI) {
        app.use(function (req, res, next) {
            var docs = options.publicDocs || options.privateDocs || '/api-docs';
            var host = 'http://' + req.headers.host;
            if (options.swaggerApiUrl) {
                host = options.swaggerApiUrl;
            }
            res.set('Swagger-API-URL', host + docs) ;
            next();

        });

        app.use('/swagger-ui', express.static(__dirname + '/swagger-ui'));
    }
    if (options.publicDocs) {

     if(options.publicDocsApiKey){
         app.get(options.publicDocs, function(req,res,next){
             if (req.query['api_key'] !== options.publicDocsApiKey) {
                 return res.status(401).send('Unauthorized access');
             }
             next();
         })
     }
        app.get(options.publicDocs, function (req,res, next) {
            res.json(apis.publicApi);

        });
    }
    var privateDocs = options.privateDocs || '/api-docs';
    if(options.privateDocsApiKey){
        app.get(privateDocs, function(req,res,next){
            if (req.query['api_key'] !== options.privateDocsApiKey) {
                return res.status(401).send('Unauthorized access');
            }
            next();
        });
    }
    app.get(options.privateDocs, function (req,res) {
        res.json(apis.privateApi);

    });

    var mountPath = options.mountPath || '/';
    var swaggerizeApi = extend({},apis.privateApi);
    swaggerizeApi.basePath = mountPath;

    var swaggerizeOptions = {docspath: options.privateDocs, handlers: path.resolve(options.handlers), api: swaggerizeApi};
    app.use(swaggerize(swaggerizeOptions));

    return app;
};



