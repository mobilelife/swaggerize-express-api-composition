# swaggerize-express-api-composition

Api composition of separate swagger files, allows to split up the swagger file into multiple path and type definitions files.
Limited to swagger specification 2.0. The library is merely a decoration of swaggerize-express, that gives the following extra features:


- Decomposition of swagger specifications into, a specification file, [paths] and [definitions]
- Exposure of a private and public API, private api the full specification, the public api a subset.
- Possibility to include the swaggerUI on the express server 

See the basic information about [swaggerize-express](https://raw.githubusercontent.com/krakenjs/swaggerize-express/master/README.md) 
