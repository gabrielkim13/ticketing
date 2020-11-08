import express from 'express';

const app = express();

app.use(express.json());

app.get('/api/users/currentuser', (req, res) => {
  return res.send();
})

app.listen(3000, () => {
  console.log('Auth Service: Listening on port 3000!');
});
