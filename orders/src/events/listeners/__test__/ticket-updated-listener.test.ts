import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Subjects, TicketUpdatedEvent } from '@gabrielkim13-ticketing/common';

import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

async function setup() {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Title',
    price: 1,
  });

  await ticket.save();

  const data: TicketUpdatedEvent = {
    subject: Subjects.TicketUpdated,
    data: {
      id: ticket.id,
      title: 'Title (updated)',
      price: 2,
      version: ticket.version + 1,
      userId: mongoose.Types.ObjectId().toHexString(),
    },
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
}

describe('TicketUpdatedListener', () => {
  it('should be able to update a ticket', async () => {
    const { listener, data: { data }, message } = await setup();

    await listener.onMessage(data, message);

    const ticket = await Ticket.findById(data.id);

    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
    expect(ticket!.version).toEqual(data.version);
  });

  it('should throw an error if the ticket to be updated does not exist', async (done) => {
    const { listener, data: { data }, message } = await setup();

    await Ticket.deleteOne({ _id: data.id });

    try {
      await listener.onMessage(data, message);
    } catch {
      return done();
    }

    throw new Error();
  });

  it('should not ack the message if the event has a skipped version number', async (done) => {
    const { listener, data: { data }, message } = await setup();

    data.version++;

    try {
      await listener.onMessage(data, message);
    } catch {
      expect(message.ack).not.toHaveBeenCalled();

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
