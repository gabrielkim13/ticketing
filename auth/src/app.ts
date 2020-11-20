import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';

import { errorHandler } from '@gabrielkim13-ticketing/common';

const app = express();

app.set('trust proxy', true);

app.use(express.json());

app.use(cookieSession({
  signed: false,
  secure: false, // process.env.NODE_ENV !== 'test',
}));

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.use(errorHandler);

export { app };
