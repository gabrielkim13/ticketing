import jwt from 'jsonwebtoken';

async function signup(id: string = 'id', email: string = 'test@test.com') {
  const token = jwt.sign({
    id: id,
    email: email,
  }, process.env.JWT_KEY!);

  const sessionJson = JSON.stringify({ jwt: token });
  const sessionBase64 = Buffer.from(sessionJson).toString('base64');
  const cookie = `express:sess=${sessionBase64}`;

  return [cookie];
}

export { signup }
