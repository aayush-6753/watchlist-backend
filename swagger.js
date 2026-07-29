const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
    info: {
        title: 'Watchlist API',
        description: 'API for managing saved movies, TV shows, and genres',
        version: '1.0.0'
    },
    servers: [
        {
            url: 'http://localhost:3000/api',
            description: 'Local Development Server'
        }
    ]
};

const outputFile = './swagger-output.json';
// Point to your central router file (index.js inside src/routes)
const routes = ['./src/routes/index.js'];

swaggerAutogen(outputFile, routes, doc);