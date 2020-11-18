import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { signup } from '../../test/auth-helper';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

async function createOrder(userId: string) {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Title',
    price: 1,
  });

  await ticket.save();

  const order = Order.build({
    userId,
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket,
  });

  await order.save();

  return order;
}

describe('Delete', () => {
  it('should not be accessible by non-authenticated users', async () => {
    const response = await request(app)
      .delete('/api/orders/order-id')
      .send();

    expect(response.status).toEqual(401);
  });

  it('should be accessible by authenticated users', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .delete('/api/orders/order-id')
      .set('Cookie', cookiesHeader)
      .send();

    expect(response.status).not.toEqual(401);
  });

  it('should return an error if the order ID is invalid', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .delete('/api/orders/order-id')
      .set('Cookie', cookiesHeader)
      .send();

    expect(response.status).toEqual(400);
  });

  it('should return an error if the order does not belong to the user', async () => {
    const order = await createOrder('id1')

    const cookiesHeader = await signup('id2');

    const response = await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', cookiesHeader)
      .send();

    expect(response.status).toEqual(401);
  });

  it('should delete the order specified by id', async () => {
    const order = await createOrder('id')

    const cookiesHeader = await signup('id');

    const response = await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', cookiesHeader)
      .send();

    const deletedOrder = await Order.findById(order.id);

    expect(response.status).toEqual(200);
    expect(deletedOrder?.status).toEqual(OrderStatus.Cancelled);
  });

  it('should publish a OrderCancelled event', async () => {
    const order = await createOrder('id')

    const cookiesHeader = await signup('id');

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', cookiesHeader)
      .send();

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
