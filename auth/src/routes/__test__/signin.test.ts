import request from 'supertest';

import { app } from '../../app';

describe('Signin', () => {
  it('should return a 400 status on unregistered credentials', () => {
    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: '1234',
      })
      .expect(400);
  });

  it('should return a 200 status on successful signin', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: '1234',
      });

    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: '1234',
      })
      .expect(200);
  });

  it('should set a cookie on successful signin', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: '1234',
      });

    const response = await request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: '1234',
      });

    expect(response.get('Set-Cookie')).toBeDefined();
  });

  it('should return a 400 status on invalid e-mail', () => {
    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test',
        password: '1234',
      })
      .expect(400);
  });

  it('should return a 400 status on empty password', () => {
    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: '',
      })
      .expect(400);
  });

  it('should return a 400 status on invalid password', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: '1234',
      });

    return request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'Wrong password',
      })
      .expect(400);
  });
});
