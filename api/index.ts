import express from 'express';
import cors from 'cors';
import { apiRouter } from '../src/server/routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Mount API router
app.use('/api', apiRouter);

export default app;
