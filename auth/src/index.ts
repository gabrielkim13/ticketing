import mongoose from 'mongoose';

import { app } from './app';

async function start() {
  if (!process.env.JWT_KEY) throw new Error('JWT_KEY is not defined');

  try {
    await mongoose.connect('mongodb://ticketing-auth-mongo-srv:27017/auth', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Auth Service: Listening on port 3000!');
  });
}

start();
