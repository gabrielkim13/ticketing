import request from 'supertest';

import { app } from '../../app';
import { signup } from '../../test/auth-helper';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

async function createOrder(userId: string) {
  const ticket = Ticket.build({
    title: 'Title',
    price: 1,
  });

  const order = Order.build({
    userId,
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket,
  });

  await order.save();

  return order;
}

describe('Show', () => {
  it('should not be accessible by non-authenticated users', async () => {
    const response = await request(app)
      .get('/api/orders/order-id')
      .send();

    expect(response.status).toEqual(401);
  });

  it('should be accessible by authenticated users', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .get('/api/orders/order-id')
      .set('Cookie', cookiesHeader)
      .send();

    expect(response.status).not.toEqual(401);
  });

  it('should return an error if the order ID is invalid', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .get('/api/orders/order-id')
      .set('Cookie', cookiesHeader)
      .send();

    expect(response.status).toEqual(400);
  });

  it('should return an error if the order does not belong to the user', async () => {
    const order = await createOrder('id1')

    const cookiesHeader = await signup('id2');

    const response = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', cookiesHeader)
      .send();

    expect(response.status).toEqual(401);
  });

  it('should return the order specified by id', async () => {
    const order = await createOrder('id')

    const cookiesHeader = await signup('id');

    const response = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', cookiesHeader)
      .send();

    const showOrder = response.body;

    expect(response.status).toEqual(200);
    expect(showOrder.id).toEqual(order.id);
  });
});
