import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Subjects, OrderCreatedEvent, OrderStatus } from '@gabrielkim13-ticketing/common';

import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

async function setup() {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'Title',
    price: 1,
    userId: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const data: OrderCreatedEvent = {
    subject: Subjects.OrderCreated,
    data: {
      id: mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      expiresAt: new Date().toISOString(),
      version: 0,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
      userId: mongoose.Types.ObjectId().toHexString(),
    },
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
}

describe('OrderCreatedListener', () => {
  it('should reserve the ticket for the created order', async () => {
    const { listener, data: { data }, message } = await setup();

    await listener.onMessage(data, message);

    const ticket = await Ticket.findById(data.ticket.id);

    expect(ticket).toBeDefined();
    expect(ticket?.orderId).toEqual(data.id);
  });

  it('should publish a TicketUpdated event after reserving the ticket', async () => {
    const { listener, data: { data }, message } = await setup();

    await listener.onMessage(data, message);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it('should throw an error if the reserved ticket does not exist', async (done) => {
    const { listener, data: { data }, message } = await setup();

    await Ticket.deleteOne({ _id: data.ticket.id });

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
