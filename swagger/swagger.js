const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FaceTok API Documentation',
      version: '1.0.0',
      description: 'API documentation for FaceTok application',
    },
    servers: [
      {
        url: 'http://localhost:3000', // URL of the API server
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Define the paths to the API docs
  apis: [
    './routes/**/*.js',
    './controllers/**/*.js',
    './models/**/*.js',
    './swagger/**/*.js'
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
