import React, { useRef, useCallback, useState } from 'react';
import Router from 'next/router';

import Errors from '../../components/errors';

import ticketsService from '../../services/tickets';

const NewTicket = () => {
  const titleInputRef = useRef(null);
  const priceInputRef = useRef(null);

  const [errors, setErrors] = useState([]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    setErrors([]);

    const title = titleInputRef.current.value;
    const price = parseFloat(priceInputRef.current.value);

    if (isNaN(price) || price <= 0) return alert('Please inform a valid price');

    try {
      await ticketsService().create({ title, price });

      Router.push('/');
    } catch (err) {
      const { errors: responseErrors } = err.response.data;

      setErrors(responseErrors);
    }
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input className="form-control" id="title" type="text" ref={titleInputRef} />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input className="form-control" id="price" type="number" ref={priceInputRef} />
        </div>

        <Errors errors={errors} />

        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}

export default NewTicket;
