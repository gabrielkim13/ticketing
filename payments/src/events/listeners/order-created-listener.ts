import { Message } from 'node-nats-streaming';

import { Subjects, Listener, OrderCreatedEvent } from '@gabrielkim13-ticketing/common';

import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { id, userId, status, ticket } = data;

    const order = Order.build({
      id,
      userId,
      status,
      price: ticket.price,
    });

    await order.save();

    msg.ack();
  }
}
