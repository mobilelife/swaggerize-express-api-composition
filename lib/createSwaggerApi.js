var is = require('core-util-is');
var assert = require('assert');
var extend = require('util')._extend;
var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
/**
 * Returns a privateApi and publicApi. The private Api is the full api, composes from the spec, paths and definition files.
 * The public Api contains only path operations that are tagged with the publicTag.
 *
 * @param spec the swagger 2.0 specification file, without paths and definitions, no host, schemes an basePaths.
 * to allow for composition of paths and definitions from separate files, and to configure host information on deployment.
 * @param host the host address used in the swagger file, and by the swagger ui to call the services,
 * should point to the url where the service is deployed.
 * @param schemes should be configured to the protocol schemes supported on the deployed url
 * @param basePath should be configured to the basic path of the host where the service is deployed.
 * @param paths array of swagger 2.0 path definitions, it is not allowed to have two identical paths.
 * @param definitions array of swagger 2.0 type definitions, it is not allowed to have two types with the same name
 * @param publicTag if defined a public api is created, containing only the path operations that are tagged with the publicTag
 * @returns {{publicApi, privateApi}}
 */
function createSwaggerAPI(host,schemes,basePath,spec, paths, definitions, publicTag){
    var swaggerSpec = spec;
    if(is.isString(spec)){
        swaggerSpec = loadJSONOrYML(spec);
    }


    assert.ok(is.isString(swaggerSpec.swagger),"swagger version tag of spec must be a string");
    assert.ok(parseFloat(swaggerSpec.swagger) === 2.0,"swagger version must be 2.0");
    assert.ok(is.isUndefined(swaggerSpec.paths), "Paths must be placed in separate files");
    assert.ok(is.isUndefined(swaggerSpec.definitions), "Definitions must be placed in separate files");
    assert.ok(is.isUndefined(swaggerSpec.host), "Host is supplied separately");
    assert.ok(is.isUndefined(swaggerSpec.schemes), "Schemes is supplied separately");
    assert.ok(is.isUndefined(swaggerSpec.basePath), "BasePath is supplied separately");

    var privatePaths = paths.map(function (path) {
        assert.ok(is.isObject(path) || is.isString(path));

        if (is.isObject(path)) {
            return path;
        }
        if (is.isString(path)) {
            return loadJSONOrYML(path);
        }
    });
    var seenEndPoints ={};

    privatePaths.forEach(function(path){
        var keys = Object.keys(path);
        keys.forEach(function (key) {
            assert.ok(is.isUndefined(seenEndPoints[key]), "Swagger path "+ key + " is defined multiple times");
            seenEndPoints[key] = true;
        });
    });

    var publicPaths = privatePaths.map(function (path) {
        var publicPath = {};
        var keys = Object.keys(path);

        keys.forEach(function (key) {
            var endPoint = path[key];
            var operationKeys = Object.keys(endPoint);

            operationKeys.forEach(function(operationKey){

                if (is.isArray(endPoint[operationKey].tags)) {
                    var tags = endPoint[operationKey].tags;
                    tags.forEach(function (tag) {
                        if (is.isString(tag) && tag.toLowerCase() === publicTag) {
                            if(!publicPath[key]){
                                publicPath[key] ={};
                            }
                            var publicOperation = extend({},endPoint[operationKey]);
                            publicOperation.tags = publicOperation.tags.filter(function(tag){
                                return is.isString(tag) && tag.toLowerCase() !== publicTag;
                            });
                            publicPath[key][operationKey] = publicOperation;
                        }
                    });
                }
            });
        });
        return publicPath;
    });

    var defs = definitions.map(function (definition) {
        assert.ok(is.isObject(definition) || is.isString(definition));
        if (is.isObject(definition)) {
            return definition;
        }
        if (is.isString(definition)) {
            return loadJSONOrYML(definition);
        }
    });

    var seenDefinitions = {};
    defs.forEach(function(def){
        var keys = Object.keys(def);
        keys.forEach(function(key){
            assert.ok(is.isUndefined(seenDefinitions[key]), 'Definition ' + key + 'is defined multiple times');
            seenDefinitions[key] = true;
        });
    });
    var combinedDefinitions =  defs.reduce(function(defA,defB){
        return extend(defA,defB);
    },{});

    var publicApi = extend({},swaggerSpec);
    publicApi.host = host;
    publicApi.schemes = schemes;
    publicApi.basePath = basePath;
    publicApi.paths = publicPaths.reduce(function(pathA,pathB){
        return extend(pathA, pathB);
    },{});
    publicApi.definitions = combinedDefinitions;

    var privateApi = extend({},swaggerSpec);
    privateApi.host= host;
    privateApi.schemes = schemes;
    privateApi.basePath = basePath;
    privateApi.paths = privatePaths.reduce(function(pathA,pathB){
        return extend(pathA, pathB);
    },{});
    privateApi.definitions = combinedDefinitions;


    return {publicApi: publicApi, privateApi:privateApi};
}

/**
 * Function copied from swaggerize-express index.js and modified to handle paths an file existence.
 */
function loadJSONOrYML(filePath) {
    var apiPath = path.resolve(filePath);
    assert.ok(fs.existsSync(apiPath), "file " + apiPath + " does not exists");
    if (apiPath.length > 5 && apiPath.indexOf('.yaml') === apiPath.length - 5 || apiPath.length >4 && apiPath.indexOf('.yml') === apiPath.length - 4) {
        return yaml.load(fs.readFileSync(apiPath));
    }
    return require(apiPath);
}

module.exports = createSwaggerAPI;