const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Condo360 Polls API',
      version: '1.0.0',
      description: 'API para el sistema de encuestas de Condo360',
    },
    servers: [
      {
        url: 'https://api.bonaventurecclub.com/polls',
        description: 'Servidor de producción'
      },
      {
        url: 'http://localhost:4000/polls',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        wordpressAuth: {
          type: 'apiKey',
          name: 'X-WordPress-User-ID',
          in: 'header',
          description: 'ID de usuario de WordPress para autenticación'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/swagger/schemas.js'],
};

module.exports = swaggerJsdoc(options);