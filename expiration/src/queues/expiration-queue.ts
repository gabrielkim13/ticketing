import Queue from 'bull';

import { natsWrapper } from '../nats-wrapper';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: process.env.REDIS_HOST!,
});

expirationQueue.process(async (job) => {
  const { orderId } = job.data;

  new ExpirationCompletePublisher(natsWrapper.client).publish({ orderId });
});

export { expirationQueue };
