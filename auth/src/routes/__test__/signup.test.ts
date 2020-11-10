import request from 'supertest';

import { app } from '../../app';

describe('Signup', () => {
  it('should return a 201 status on successful signup', () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: '1234',
      })
      .expect(201);
  });

  it('should set a cookie on successful signup', async () => {
    const response = await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: '1234',
      });

    expect(response.get('Set-Cookie')).toBeDefined();
  });

  it('should return a 400 error on invalid e-mail', () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test',
        password: '1234',
      })
      .expect(400);
  });

  it('should return a 400 error on passwords shorter than 4 digits', () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: '123',
      })
      .expect(400);
  });

  it('should return a 400 error on passwords longer than 20 digits', () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'This is a password longer than 20 digits...',
      })
      .expect(400);
  });

  it('should return a 400 error on e-mails already in use', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: '1234',
      });

    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: '1234',
      })
      .expect(400);
  });
});
