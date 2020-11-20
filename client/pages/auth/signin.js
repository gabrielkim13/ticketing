import { useRef, useState, useCallback } from 'react';
import Router from 'next/router';

import Errors from '../../components/errors';

import authService from '../../services/auth';

export default function Signin() {
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const [errors, setErrors] = useState([]);

  const handleSubmit = useCallback(async event => {
    event.preventDefault();

    setErrors([]);

    const email = emailInputRef.current.value;
    const password = passwordInputRef.current.value;

    try {
      await authService().signin({ email, password });

      Router.push('/');
    } catch (err) {
      const { errors: responseErrors } = err.response.data;

      setErrors(responseErrors);
    }
  }, []);

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Sign In</h1>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" className="form-control" ref={emailInputRef} />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" className="form-control" ref={passwordInputRef} />
        </div>

        <Errors errors={errors} />

        <button className="btn btn-primary">Sign In</button>
      </form>
    </div>
  );
}
