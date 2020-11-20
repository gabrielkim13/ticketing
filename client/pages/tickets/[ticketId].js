import React, { useState, useCallback } from 'react';
import Router from 'next/router';

import Errors from '../../components/errors';

import ticketsService from '../../services/tickets';
import ordersService from '../../services/orders';

const TicketDetail = ({ ticket: { id, title, price } }) => {
  const [errors, setErrors] = useState([]);

  const handlePurchase = useCallback(async () => {
    setErrors([]);

    try {
      const order = await ordersService().create({ ticketId: id });

      Router.push("/orders/[orderId]", `/orders/${order.id}`);
    } catch (err) {
      const { errors: responseErrors } = err.response.data;

      setErrors(responseErrors);
    }
  }, []);

  return (
    <div>
      <h1>{title}</h1>
      <h4>Price: {price}</h4>

      <Errors errors={errors} />

      <button className="btn btn-primary" onClick={handlePurchase}>Purchase</button>
    </div>
  );
};

TicketDetail.getInitialProps = async (ctx) => {
  const { ticketId } = ctx.query;

  const ticket = await ticketsService(ctx.req?.headers).show(ticketId);

  return { ticket };
};

export default TicketDetail;
