const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Condo360 Surveys API',
      version: '1.0.0',
      description: 'API for managing surveys in a condominium environment',
    },
    servers: [
      {
        url: 'http://localhost:3000/polls',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // files containing annotations as above
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/polls/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};