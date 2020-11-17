import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { signup } from '../../test/auth-helper';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

async function createTicket(title: string = 'Title', price: number = 1) {
  const ticket = Ticket.build({ title, price });

  await ticket.save();

  return ticket;
}

describe('Create', () => {
  it('should not be accessible by non-authenticated users', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({});

    expect(response.status).toEqual(401);
  });

  it('should be accessible by authenticated users', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .post('/api/orders')
      .set('Cookie', cookiesHeader)
      .send({});

    expect(response.status).not.toEqual(401);
  });

  it('should return an error if an invalid ticketId is provided', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .post('/api/orders')
      .set('Cookie', cookiesHeader)
      .send({
        ticketId: 'invalid-id',
      });

    expect(response.status).toEqual(400);
  });

  it('should return a 404 error if the ticket does not exist', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .post('/api/orders')
      .set('Cookie', cookiesHeader)
      .send({
        ticketId: mongoose.Types.ObjectId(),
      });

    expect(response.status).toEqual(404);
  });

  it('should return an error if the ticket is already reserved', async () => {
    const ticket = await createTicket();

    const cookiesHeaderFirstUser = await signup('id1', 'test1@test.com');
    await request(app)
      .post('/api/orders')
      .set('Cookie', cookiesHeaderFirstUser)
      .send({
        ticketId: ticket.id,
      });

    const cookiesHeaderSecondUser = await signup('id2', 'test2@test.com');
    const response = await request(app)
      .post('/api/orders')
      .set('Cookie', cookiesHeaderSecondUser)
      .send({
        ticketId: ticket.id,
      });

    expect(response.status).toEqual(400);
  });

  it('should be able to create a new order', async () => {
    const ticket = await createTicket();

    const cookiesHeader = await signup();
    const response = await request(app)
      .post('/api/orders')
      .set('Cookie', cookiesHeader)
      .send({
        ticketId: ticket.id,
      });

    const newOrder = response.body;

    expect(response.status).toEqual(201);
    expect(Order.exists({ _id: newOrder.id, ticket })).toBeTruthy();
  });

  it('should publish a OrderCreated event', async () => {
    const ticket = await createTicket();

    const cookiesHeader = await signup();

    await request(app)
      .post('/api/orders')
      .set('Cookie', cookiesHeader)
      .send({
        ticketId: ticket.id,
      });

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
