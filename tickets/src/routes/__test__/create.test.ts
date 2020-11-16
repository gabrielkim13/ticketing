import request from 'supertest';

import { app } from '../../app';
import { signup } from '../../test/auth-helper';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

describe('Create', () => {
  it('should handle POST requests on /api/tickets', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({});

    expect(response.status).not.toEqual(404);
  });

  it('should not be accessible by non-authenticated users', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({});

    expect(response.status).toEqual(401);
  });

  it('should be accessible by authenticated users', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookiesHeader)
      .send({});

    expect(response.status).not.toEqual(401);
  });

  it('should return an error if an invalid title is provided', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookiesHeader)
      .send({
        title: '',
        price: 1,
      });

    expect(response.status).toEqual(400);
  });

  it('should return an error if an invalid price is provided', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookiesHeader)
      .send({
        title: 'Title',
        price: -1,
      });

    expect(response.status).toEqual(400);
  });

  it('should be able to create a new ticket', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookiesHeader)
      .send({
        title: 'Title',
        price: 1,
      });

    const newTicket = response.body;

    expect(response.status).toEqual(201);
    expect(Ticket.exists({ _id: newTicket.id })).toBeTruthy();
  });

  it('should publish a TicketCreated event', async () => {
    const cookiesHeader = await signup();

    await request(app)
      .post('/api/tickets')
      .set('Cookie', cookiesHeader)
      .send({
        title: 'Title',
        price: 1,
      });

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
