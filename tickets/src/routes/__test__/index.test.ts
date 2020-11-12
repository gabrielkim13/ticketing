import request from 'supertest';

import { app } from '../../app';
import { signup } from '../../test/auth-helper';

async function createNTickets(N: number) {
  const cookiesHeader = await signup();

  for (let i = 1; i <= N; ++i) {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', cookiesHeader)
      .send({
        title: `Title ${i}`,
        price: i
      });
  }
}

describe('Index', () => {
  it('should return all of the tickets available', async () => {
    await createNTickets(3);

    const response = await request(app)
      .get(`/api/tickets`)
      .send();

    const tickets = response.body;

    expect(tickets).toHaveLength(3);
  });
});
