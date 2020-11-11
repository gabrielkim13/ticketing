import Head from 'next/head';

import authService from '../services/auth';

const Home = ({ user }) => {
  return (
    <div className='container'>
      <Head>
        <title>Ticketing</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {
          user
            ? <h1>You are signed in!</h1>
            : <h1>You are not signed in...</h1>
        }
      </main>
    </div>
  );
};

export default Home;
