import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Subjects, ExpirationCompleteEvent, OrderStatus } from '@gabrielkim13-ticketing/common';

import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';

async function setup() {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Title',
    price: 1,
  });
  await ticket.save();

  const order = Order.build({
    expiresAt: new Date(),
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    ticket
  })
  await order.save();

  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const data: ExpirationCompleteEvent = {
    subject: Subjects.ExpirationComplete,
    data: {
      orderId: order.id,
    },
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
}

describe('ExpirationCompleteListener', () => {
  it('should cancel the order on expiration event', async () => {
    const { listener, data: { data }, message } = await setup();

    await listener.onMessage(data, message);

    const order = await Order.findById(data.orderId);

    expect(order?.status).toEqual(OrderStatus.Cancelled);
  });

  it('should ack the message', async () => {
    const { listener, data: { data }, message } = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
  });

  it('should publish a OrderCancelled event after cancelling the order', async () => {
    const { listener, data: { data }, message } = await setup();

    await listener.onMessage(data, message);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it('should not cancel orders that have already been completed', async () => {
    const { listener, data: { data }, message } = await setup();

    const order = await Order.findById(data.orderId);
    order?.set({ status: OrderStatus.Complete });
    await order?.save();

    await listener.onMessage(data, message);

    const updatedOrder = await Order.findById(data.orderId);

    expect(updatedOrder?.status).toEqual(order?.status);
    expect(updatedOrder?.version).toEqual(order?.version);
    expect(natsWrapper.client.publish).not.toHaveBeenCalled();
    expect(message.ack).toHaveBeenCalled();
  });
});
