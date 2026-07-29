const { createSwaggerSpec } = require('next-swagger-doc');

const swaggerSpec = createSwaggerSpec({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Skill Barter API',
      version: '1.0.0',
      description: 'API documentation for the Skill Barter application',
    },
    components: {
      schemas: {
        Skill: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            category: {
              type: 'string',
            },
            level: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        User: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                },
                email: {
                    type: 'string',
                },
                avatar: {
                    type: 'string',
                },
                bio: {
                    type: 'string',
                },
                location: {
                    type: 'string',
                },
                availability: {
                    type: 'string',
                },
                skills: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
            },
        },
        Group: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                },
                description: {
                    type: 'string',
                },
                category: {
                    type: 'string',
                },
                tags: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
                isPublic: {
                    type: 'boolean',
                },
                maxMembers: {
                    type: 'number',
                },
                rules: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
            },
        },
        Exchange: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                },
                scheduledFor: {
                    type: 'string',
                },
            },
        },
      },
    },
  },
  apiFolder: 'src/app/api', // The folder where your API routes are located
});

module.exports = swaggerSpec;
