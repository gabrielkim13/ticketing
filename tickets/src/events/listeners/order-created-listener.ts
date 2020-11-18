import { Message } from 'node-nats-streaming';

import { Subjects, Listener, OrderCreatedEvent } from '@gabrielkim13-ticketing/common';

import { queueGroupName } from './queue-group-name';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { Ticket } from '../../models/ticket';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { id: orderId, ticket: orderTicket } = data;

    const ticket = await Ticket.findById(orderTicket.id);

    if (!ticket) throw new Error('Ticket not found');

    ticket.set({ orderId });

    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}
