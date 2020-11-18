import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Subjects, TicketCreatedEvent } from '@gabrielkim13-ticketing/common';

import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

function setup() {
  const listener = new TicketCreatedListener(natsWrapper.client);

  const data: TicketCreatedEvent = {
    subject: Subjects.TicketCreated,
    data: {
      id: mongoose.Types.ObjectId().toHexString(),
      title: 'Title',
      price: 1,
      version: 0,
      userId: mongoose.Types.ObjectId().toHexString(),
    },
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
}

describe('TicketCreatedListener', () => {
  it('should create and save a ticket', async () => {
    const { listener, data: { data }, message } = setup();

    await listener.onMessage(data, message);

    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
  });

  it('should ack the message', async () => {
    const { listener, data: { data }, message } = setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
  });
});
