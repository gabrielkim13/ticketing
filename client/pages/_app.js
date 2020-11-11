import 'bootstrap/dist/css/bootstrap.css';

import Header from '../components/header';

import authService from '../services/auth';

function AppComponent({ Component, pageProps, user }) {
  return (
    <>
      <Header user={user} />
      <Component {...pageProps} />
    </>
  );
}

AppComponent.getInitialProps = async ({ ctx: { req } }) => {
  const currentUser = await authService(req?.headers).currentUser();

  return { pageProps: { user: currentUser }, user: currentUser };
};

export default AppComponent;
