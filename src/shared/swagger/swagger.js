"use strict";
//----------------------------------------------------------------
const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

// Cấu hình cơ bản của Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FaceTok API Documentation',
      version: '1.0.0',
      description: 'Documentation for FaceTok REST API',
      contact: {
        name: 'FaceTok Team'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server'
        }
      ]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Đường dẫn tới các API routes
  apis: [
    path.join(__dirname, 'definitions', '*.js'),
    path.join(__dirname, 'routes', '*.js')
  ]
};

// Khởi tạo swagger-jsdoc
const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec; 