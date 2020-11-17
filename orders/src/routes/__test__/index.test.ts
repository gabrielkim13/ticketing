import request from 'supertest';

import { app } from '../../app';
import { signup } from '../../test/auth-helper';
import { Order, OrderDocument, OrderStatus } from '../../models/order';
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

describe('Index', () => {
  it('should not be accessible by non-authenticated users', async () => {
    const response = await request(app)
      .get('/api/orders')
      .send();

    expect(response.status).toEqual(401);
  });

  it('should be accessible by authenticated users', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .get('/api/orders')
      .set('Cookie', cookiesHeader)
      .send();

    expect(response.status).not.toEqual(401);
  });

  it('should return the current user orders', async () => {
    await createOrder('id1');
    await createOrder('id1');
    await createOrder('id2');

    const cookiesHeader = await signup('id1');

    const response = await request(app)
      .get('/api/orders')
      .set('Cookie', cookiesHeader)
      .send();

    const orders = response.body as OrderDocument[];

    expect(response.status).toEqual(200);
    expect(orders).toHaveLength(2);
    expect(orders[0].userId).toEqual('id1');
    expect(orders[0].ticket).toBeDefined();
  });
});
