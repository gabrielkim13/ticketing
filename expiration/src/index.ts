import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

async function start() {
  console.log('Expiration service started!')

  if (!process.env.NATS_CLUSTER_ID) throw new Error('NATS_CLUSTER_ID is not defined');
  if (!process.env.NATS_CLIENT_ID) throw new Error('NATS_CLIENT_ID is not defined');
  if (!process.env.NATS_URL) throw new Error('NATS_URL is not defined');
  if (!process.env.REDIS_HOST) throw new Error('REDIS_HOST is not defined');

  try {
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');

      process.exit();
    });

    new OrderCreatedListener(natsWrapper.client).listen();

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());
  } catch (err) {
    console.error(err);
  }
}

start();
