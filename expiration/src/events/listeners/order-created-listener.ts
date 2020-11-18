import { Message } from 'node-nats-streaming';

import { Subjects, Listener, OrderCreatedEvent } from '@gabrielkim13-ticketing/common';

import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { id: orderId, expiresAt } = data;

    const delay = new Date(expiresAt).getTime() - new Date().getTime();

    await expirationQueue.add({ orderId }, { delay });

    msg.ack();
  }
}
