import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { signup } from '../../test/auth-helper';

describe('Show', () => {
  it('should return a 404 if the ticket is not found', async () => {
    const unknownId = mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/tickets/${unknownId}`)
      .send();

    expect(response.status).toEqual(404);
  });

  it('should return the ticket if it is found', async () => {
    const cookiesHeader = await signup();

    const createResponse = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookiesHeader)
      .send({
        title: 'Title',
        price: 1
      });

    const createTicket = createResponse.body;

    const response = await request(app)
      .get(`/api/tickets/${createTicket.id}`)
      .send();

    const ticket = response.body;

    expect(ticket).toEqual(createTicket);
  });
});
