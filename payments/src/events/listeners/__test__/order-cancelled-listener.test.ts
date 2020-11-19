import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Subjects, OrderCancelledEvent, OrderStatus } from '@gabrielkim13-ticketing/common';

import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';

async function setup() {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 1,
  });

  await order.save();

  const data: OrderCancelledEvent = {
    subject: Subjects.OrderCancelled,
    data: {
      id: order.id,
      version: order.version + 1,
      ticket: {
        id: mongoose.Types.ObjectId().toHexString(),
      },
    },
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
}

describe('OrderCancelledListener', () => {
  it('should mark the order as cancelled', async () => {
    const { listener, data: { data }, message } = await setup();

    await listener.onMessage(data, message);

    const order = await Order.findById(data.id);

    expect(order?.status).toEqual(OrderStatus.Cancelled);
  });

  it('should throw an error if the cancelled order does not exist', async (done) => {
    const { listener, data: { data }, message } = await setup();

    await Order.deleteOne({ _id: data.id });

    try {
      await listener.onMessage(data, message);
    } catch {
      return done();
    }

    throw new Error();
  });

  it('should ack the message', async () => {
    const { listener, data: { data }, message } = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
  });
});
