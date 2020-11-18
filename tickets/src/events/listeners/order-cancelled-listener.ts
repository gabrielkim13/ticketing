import { Message } from 'node-nats-streaming';

import { Subjects, Listener, OrderCancelledEvent } from '@gabrielkim13-ticketing/common';

import { queueGroupName } from './queue-group-name';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { Ticket } from '../../models/ticket';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const { ticket: orderTicket } = data;

    const ticket = await Ticket.findById(orderTicket.id);

    if (!ticket) throw new Error('Ticket not found');

    ticket.set({ orderId: undefined });

    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });

    msg.ack();
  }
}
