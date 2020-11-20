import 'bootstrap/dist/css/bootstrap.css';

import Header from '../components/header';

import authService from '../services/auth';

function AppComponent({ Component, pageProps, user }) {
  return (
    <div>
      <Header user={user} />

      <div className="container">
        <Component user={user} {...pageProps} />
      </div>
    </div>
  );
}

AppComponent.getInitialProps = async ({ ctx, Component }) => {
  const currentUser = await authService(ctx.req?.headers).currentUser();

  let pageProps = {};
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx, currentUser);
  }

  return { pageProps, user: currentUser };
};

export default AppComponent;
