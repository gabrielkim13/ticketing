import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';

import { errorHandler } from '@gabrielkim13-ticketing/common';

import { createRouter } from './routes/create';
import { showRouter } from './routes/show';
import { indexRouter } from './routes/index';
import { updateRouter } from './routes/update';

const app = express();

app.set('trust proxy', true);

app.use(express.json());

app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test'
}));

app.use(createRouter);
app.use(showRouter);
app.use(indexRouter);
app.use(updateRouter);

app.use(errorHandler);

export { app };
