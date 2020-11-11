import { useRef, useState, useCallback } from 'react';
import Router from 'next/router';

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
      setErrors(err.errors);
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

        {
          errors && errors.length > 0 &&
          <div className="alert alert-danger">
            <h4>Oops...</h4>

            <ul>
              {errors.map(({ message, field }) => <li key={message}>{`${field}: ${message}`}</li>)}
            </ul>
          </div>
        }

        <button className="btn btn-primary">Sign In</button>
      </form>
    </div>
  );
}
