import request from 'supertest';

import { app } from '../../app';

import { signup } from '../../test/auth-helper';

describe('Signin', () => {
  it('should return the current user from the JWT on the cookie', async () => {
    const cookieHeaders = await signup('test@test.com', '1234');

    const response = await request(app)
      .get('/api/users/currentuser')
      .set('Cookie', cookieHeaders)
      .send()
      .expect(400);

    const { currentUser } = response.body;

    expect(currentUser).toMatchObject({ email: 'test@test.com' });
  });

  it('should return a null current user if not authenticated', async () => {
    const response = await request(app)
      .get('/api/users/currentuser')
      .send();

    const { currentUser } = response.body;

    expect(currentUser).toBeNull();
  });
});
