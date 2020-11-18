import { Message } from 'node-nats-streaming';

import { Subjects, Listener, ExpirationCompleteEvent, OrderStatus } from '@gabrielkim13-ticketing/common';

import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const { orderId } = data;

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) throw new Error('Order not found');

    switch (order.status) {
      case OrderStatus.Created:
      case OrderStatus.AwaitingPayment:
        order.set({ status: OrderStatus.Cancelled });

        await order.save();

        await new OrderCancelledPublisher(this.client).publish({
          id: orderId,
          version: order.version,
          ticket: {
            id: order.ticket.id,
          },
        });

        break;

      default:
        break;
    }

    msg.ack();
  }
}
