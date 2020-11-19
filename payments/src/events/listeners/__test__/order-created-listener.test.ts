import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Subjects, OrderCreatedEvent, OrderStatus } from '@gabrielkim13-ticketing/common';

import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';

function setup() {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent = {
    subject: Subjects.OrderCreated,
    data: {
      id: mongoose.Types.ObjectId().toHexString(),
      userId: mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      expiresAt: new Date().toISOString(),
      version: 0,
      ticket: {
        id: mongoose.Types.ObjectId().toHexString(),
        price: 1,
      },
    },
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
}

describe('OrderCreatedListener', () => {
  it('should create and save an order', async () => {
    const { listener, data: { data }, message } = setup();

    await listener.onMessage(data, message);

    const order = await Order.findById(data.id);

    expect(order).toBeDefined();
  });

  it('should ack the message', async () => {
    const { listener, data: { data }, message } = setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
  });
});
