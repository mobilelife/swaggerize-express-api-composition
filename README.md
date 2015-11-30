# swaggerize-express-api-composition

Api composition of separate swagger files, allows to split up the swagger file into multiple path and type definitions files.
Limited to swagger specification 2.0. The library is merely a decoration of swaggerize-express, that gives the following extra features:


- Decomposition of swagger specifications into, a specification file, [paths] and [definitions]
- Exposure of a private and public API, private api the full specification, the public api a subset.
- Possibility to include the swaggerUI on the express server 

See the basic information about [swaggerize-express](https://github.com/krakenjs/swaggerize-express/blob/master/README.md) 


####Example of swaggerize-express-api-composition:

```javascript
var swaggerize = require('swaggerize-express-api-composition');

app.use(swaggerize({
  paths: ['./test/swagger/petstore/paths/pets.json',
    './test/swagger/petstore/paths/pets/{id}.json'],
  host: 'localhost:4000',
  schemes: ['http'],
  basePath: '/',
  definitions: ['./test/swagger/petstore/definitions/pet.json',
    './test/swagger/petstore/definitions/newPet.json',
    './test/swagger/petstore/definitions/error.json'],
  spec:'./test/swagger/petstore/swagger.json',
  swaggerUI: true,
  privateDocs: '/private-api',
  publicDocs: '/public-api',
  publicTag: 'public',
  handlers: './test/express/handlers',
  privateDocsApiKey: 'privateSecret',
  publicDocsApiKey: 'publicSecret',
  swaggerApiUrl: 'http://localhost:4000'
}));
```
#### Options to the swaggerize-express-api-composition
 - **spec** the swagger 2.0 specification file, without paths and definitions, no host, schemes an basePaths. to allow for composition of paths and definitions from separate files, and to configure host information on deployment.

 - **host** the host address used in the swagger file, and by the swagger ui to call the services, should point to the url where the service is deployed.

 - **schemes** should be configured to the protocol schemes supported on the deployed url

 - **basePath** should be configured to the base path of the host where the service is deployed.

 - **mountPath** internal base path used by express swaggerize to build path elements.

 - **handlers** path to where the express swaggerize handlers are defined. If the service is deployed in a docker file,   the internal basePath might be '/', whereas the external may be deployed at companyurl.com/serviceBasePath, for example because of the use of dns cname.

 - **paths** array of swagger 2.0 path definitions, it is not allowed to have two identical paths.

 - **definitions** array of swagger 2.0 type definitions, it is not allowed to have two types with the same name

 - **publicTag** if defined a public api is created, containing only the path operations that are tagged with the publicTag

 - **swaggerUI** boolean if true the swaggerUI is exposed on the service a http://host/basePath/swagger-ui

 - **swaggerApiUrl** when swaggerUI is on, the swaggerUI is expecting the docs file to be pointing to this url.

 - **privateDocs** the place where the private specs file can be downloaded scheme://host/basePath/privateDocs, if undefined privateDocs=api-docs

 - **publicDocs** if defined a public api is also deployed scheme://host/basePath/publicDocs.A public api is a subset of the full api, that can be used to give to external business partners as documentation of subset of the api.

 - **privateDocsApiKey** api key used to protect the private api docs.

 - **publicDocsApiKey** api key used to protect the public api docs.

#### Code example 
 look at at the testcases
- express server example [server.js](./test/express/server.js)
- api decomposition example [swagger](./test/swagger)
