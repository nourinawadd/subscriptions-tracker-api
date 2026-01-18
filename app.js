import express from 'express';
import { PORT } from './config/env.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import workflowRouter from './routes/workflow.routes.js';

import connectToDatabase from './database/mongodb.js';
import errorMiddleware from './middleware/error.middleware.js';
import cookieParser from 'cookie-parser';
import arcjetMiddleware from './middleware/arcjet.middleware.js';

const app = express();

const swaggerDocument = YAML.load('./swagger.yaml');
const swaggerOptions = {
    customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 50px 0 }
        .swagger-ui .info .title { color: #2c3e50 }
    `,
    customSiteTitle: "Subscription Tracker API",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
        persistAuthorization: true, // Keep auth token after refresh
        displayRequestDuration: true,
        filter: true, // Enable filtering
        tryItOutEnabled: true
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the Subscription Tracker API');
});

app.use(errorMiddleware);

app.listen(PORT, async () => {
    console.log(`Subscription Tracker API is running on http://localhost:${PORT}`);
    await connectToDatabase();
});

export default app
