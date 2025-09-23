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
    components: {
      schemas: {
        Survey: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              format: 'int64',
              description: 'Survey ID',
            },
            title: {
              type: 'string',
              description: 'Survey title',
            },
            description: {
              type: 'string',
              description: 'Survey description',
            },
            start_date: {
              type: 'string',
              format: 'date-time',
              description: 'Survey start date',
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              description: 'Survey end date',
            },
            status: {
              type: 'string',
              enum: ['open', 'closed'],
              description: 'Survey status',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Survey creation date',
            },
            questions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Question',
              },
            },
          },
        },
        Question: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              format: 'int64',
              description: 'Question ID',
            },
            survey_id: {
              type: 'integer',
              format: 'int64',
              description: 'Survey ID',
            },
            question_text: {
              type: 'string',
              description: 'Question text',
            },
            question_order: {
              type: 'integer',
              description: 'Question order',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Question creation date',
            },
            options: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Option',
              },
            },
          },
        },
        Option: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              format: 'int64',
              description: 'Option ID',
            },
            question_id: {
              type: 'integer',
              format: 'int64',
              description: 'Question ID',
            },
            option_text: {
              type: 'string',
              description: 'Option text',
            },
            option_order: {
              type: 'integer',
              description: 'Option order',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Option creation date',
            },
          },
        },
        CreateSurveyRequest: {
          type: 'object',
          required: ['title', 'start_date', 'end_date', 'questions'],
          properties: {
            title: {
              type: 'string',
              description: 'Survey title',
            },
            description: {
              type: 'string',
              description: 'Survey description',
            },
            start_date: {
              type: 'string',
              format: 'date-time',
              description: 'Survey start date',
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              description: 'Survey end date',
            },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                required: ['question_text', 'options'],
                properties: {
                  question_text: {
                    type: 'string',
                    description: 'Question text',
                  },
                  question_order: {
                    type: 'integer',
                    description: 'Question order',
                  },
                  options: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['option_text'],
                      properties: {
                        option_text: {
                          type: 'string',
                          description: 'Option text',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        VoteRequest: {
          type: 'object',
          required: ['wp_user_id', 'responses'],
          properties: {
            wp_user_id: {
              type: 'integer',
              format: 'int64',
              description: 'WordPress user ID',
            },
            responses: {
              type: 'array',
              items: {
                type: 'object',
                required: ['question_id', 'option_id'],
                properties: {
                  question_id: {
                    type: 'integer',
                    format: 'int64',
                    description: 'Question ID',
                  },
                  option_id: {
                    type: 'integer',
                    format: 'int64',
                    description: 'Option ID',
                  },
                },
              },
            },
          },
        },
        SurveyResult: {
          type: 'object',
          properties: {
            survey: {
              $ref: '#/components/schemas/Survey',
            },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    format: 'int64',
                  },
                  question_text: {
                    type: 'string',
                  },
                  question_order: {
                    type: 'integer',
                  },
                  options: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                          format: 'int64',
                        },
                        option_text: {
                          type: 'string',
                        },
                        option_order: {
                          type: 'integer',
                        },
                        response_count: {
                          type: 'integer',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // files containing annotations as above
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/polls/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};