import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Subjects, OrderCancelledEvent, OrderStatus } from '@gabrielkim13-ticketing/common';

import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

async function setup() {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'Title',
    price: 1,
    userId: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const data: OrderCancelledEvent = {
    subject: Subjects.OrderCancelled,
    data: {
      id: mongoose.Types.ObjectId().toHexString(),
      version: 0,
      ticket: {
        id: ticket.id,
      },
    },
  };

  ticket.set({ orderId: data.data.id });

  await ticket.save();

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
}

describe('OrderCancelledListener', () => {
  it('should release the ticket from the cancelled order', async () => {
    const { listener, data: { data }, message } = await setup();

    await listener.onMessage(data, message);

    const ticket = await Ticket.findById(data.ticket.id);

    expect(ticket).toBeDefined();
    expect(ticket?.orderId).toBeUndefined();
  });

  it('should publish a TicketUpdated event after releasing the ticket', async () => {
    const { listener, data: { data }, message } = await setup();

    await listener.onMessage(data, message);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it('should throw an error if the cancelled ticket does not exist', async (done) => {
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
