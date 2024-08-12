// swagger.js
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.2.0',
            description: 'API REST in NodeJS and Express, with authentication and authorization via JWT and MySQL Database',
        },
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Local Server',
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
        security: [
            {
                bearerAuth: [], // Aplica bearerAuth a todas las rutas por defecto
            },
        ],
    },
    apis: ['./src/modules/**/*.js'],
};

const specs = swaggerJsDoc(swaggerOptions);

export default (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
