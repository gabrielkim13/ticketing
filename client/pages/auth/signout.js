import { useEffect } from 'react';
import Router from 'next/router';

import authService from '../../services/auth';

export default function Signup() {
  useEffect(() => {
    async function signout() {
      await authService().signout();

      Router.push('/');
    }

    signout();
  }, []);

  return (
    <div className="container">
      <h1>Signing out...</h1>
    </div>
  );
}
