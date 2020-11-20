import mongoose from 'mongoose';

import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

async function start() {
  if (!process.env.JWT_KEY) throw new Error('JWT_KEY is not defined');
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined');
  if (!process.env.NATS_CLUSTER_ID) throw new Error('NATS_CLUSTER_ID is not defined');
  if (!process.env.NATS_CLIENT_ID) throw new Error('NATS_CLIENT_ID is not defined');
  if (!process.env.NATS_URL) throw new Error('NATS_URL is not defined');

  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');

      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Orders service: Listening on port 3000!');
  });
}

start();
