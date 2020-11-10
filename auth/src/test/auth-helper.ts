import request from 'supertest';

import { app } from '../app';

async function signup(email: string = 'test@test.com', password: string = '1234') {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email,
      password,
    });

  return response.get('Set-Cookie');
}

export { signup }
