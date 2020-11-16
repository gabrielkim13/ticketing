import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { signup } from '../../test/auth-helper';
import { TicketDocument } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

async function createTicket(title: string = 'Title', price: number = 1) {
  const cookiesHeader = await signup();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookiesHeader)
    .send({
      title,
      price
    });

  const ticket = response.body as TicketDocument;

  return ticket;
}

describe('Update', () => {
  it('should not be accessible by non-authenticated users', async () => {
    const ticketId = mongoose.Types.ObjectId();

    const response = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .send({});

    expect(response.status).toEqual(401);
  });

  it('should return an error if an invalid id is provided', async () => {
    const invalidId = 'invalid-id';
    const cookiesHeader = await signup();

    const response = await request(app)
      .put(`/api/tickets/${invalidId}`)
      .set('Cookie', cookiesHeader)
      .send({
        title: '',
        price: 1
      });

    expect(response.status).toEqual(400);
  });

  it('should return a 404 error if the ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId();
    const cookiesHeader = await signup();

    const response = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set('Cookie', cookiesHeader)
      .send({
        title: 'Title',
        price: 1
      });

    expect(response.status).toEqual(404);
  });

  it('should return a 401 error if the ticket does not belong to the user', async () => {
    const oldTicket = await createTicket();

    const cookiesHeader = await signup('different-id', 'different@email.com');

    const response = await request(app)
      .put(`/api/tickets/${oldTicket.id}`)
      .set('Cookie', cookiesHeader)
      .send({
        title: 'Title',
        price: 1
      });

    expect(response.status).toEqual(401);
  });

  it('should return an error if an invalid title is provided', async () => {
    const oldTicket = await createTicket();

    const cookiesHeader = await signup();

    const response = await request(app)
      .put(`/api/tickets/${oldTicket.id}`)
      .set('Cookie', cookiesHeader)
      .send({
        title: '',
        price: 1
      });

    expect(response.status).toEqual(400);
  });

  it('should return an error if an invalid price is provided', async () => {
    const oldTicket = await createTicket();

    const cookiesHeader = await signup();

    const response = await request(app)
      .put(`/api/tickets/${oldTicket.id}`)
      .set('Cookie', cookiesHeader)
      .send({
        title: 'Title',
        price: -1
      });

    expect(response.status).toEqual(400);
  });

  it('should be able to update an existing ticket', async () => {
    const oldTicket = await createTicket('Old title', 1);

    const cookiesHeader = await signup();

    const response = await request(app)
      .put(`/api/tickets/${oldTicket.id}`)
      .set('Cookie', cookiesHeader)
      .send({
        title: 'Updated title',
        price: 2
      });

    const updatedTicket = response.body as TicketDocument;

    expect(response.status).toEqual(200);
    expect(updatedTicket.title).toEqual('Updated title');
    expect(updatedTicket.price).toEqual(2);
  });

  it('should publish a TicketUpdated event', async () => {
    const oldTicket = await createTicket('Old title', 1);

    const cookiesHeader = await signup();

    await request(app)
      .put(`/api/tickets/${oldTicket.id}`)
      .set('Cookie', cookiesHeader)
      .send({
        title: 'Updated title',
        price: 2
      });

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
