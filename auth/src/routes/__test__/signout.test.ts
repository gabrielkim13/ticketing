import request from 'supertest';

import { app } from '../../app';

describe('Signout', () => {
  it('should destroy the cookie on signout', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: '1234'
      });

    const response = await request(app)
      .post('/api/users/signout')
      .send({});

    const cookieHeaders = response.get('Set-Cookie');

    console.log(cookieHeaders);

    expect(cookieHeaders).toBeDefined();
    expect(cookieHeaders[0]).toMatch(/sess=;/);
  });
});
