import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Subjects, PaymentCreatedEvent, OrderStatus } from '@gabrielkim13-ticketing/common';

import { PaymentCreatedListener } from '../payment-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';

async function setup() {
  const listener = new PaymentCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Title',
    price: 1,
  });
  await ticket.save();

  const order = Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.AwaitingPayment,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: PaymentCreatedEvent = {
    subject: Subjects.PaymentCreated,
    data: {
      id: mongoose.Types.ObjectId().toHexString(),
      orderId: order.id,
      stripeId: 'stripeId',
    },
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
}

describe('PaymentCreatedListener', () => {
  it('should update the order status to complete', async () => {
    const { listener, data: { data }, message } = await setup();

    await listener.onMessage(data, message);

    const order = await Order.findById(data.orderId);

    expect(order?.status).toEqual(OrderStatus.Complete);
  });

  it('should ack the message', async () => {
    const { listener, data: { data }, message } = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
  });
});
