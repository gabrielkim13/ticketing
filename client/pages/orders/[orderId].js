import React, { useState, useEffect, useCallback } from 'react';
import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';

import Errors from '../../components/errors';

import ordersService from '../../services/orders';
import paymentsService from '../../services/payments';

const OrderDetail = ({ order: { id: orderId, expiresAt, ticket }, user }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const [errors, setErrors] = useState([]);

  const handlePayment = useCallback(async (token) => {
    setErrors([]);

    try {
      await paymentsService().create({ token: token.id, orderId });

      Router.push('/orders');
    } catch (err) {
      const { errors: responseErrors } = err.response.data;

      setErrors(responseErrors);
    }
  }, []);

  useEffect(() => {
    function calculateTimeLeft() {
      const msLeft = new Date(expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    }

    calculateTimeLeft();

    const interval = setInterval(calculateTimeLeft, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <h1>{ticket.title}</h1>

      {
        timeLeft > 0
          ? <h4>Time left to pay: {timeLeft} seconds</h4>
          : <h4>This order has expired</h4>
      }

      <StripeCheckout
        token={handlePayment}
        stripeKey="pk_test_51HpJUgL72S5T2I6IvvGYkqsw2DLnrBqrw28OIEaxpIJeX7ua1YAdDxACr2BVROUSePF6Xqvd1lj8oe0r0cihPLMA00DT7VsdQz"
        amount={100 * ticket.price}
        email={user.email}
      />

      <Errors errors={errors} />
    </div>
  );
};

OrderDetail.getInitialProps = async (ctx) => {
  const { orderId } = ctx.query;

  const order = await ordersService(ctx.req?.headers).show(orderId);

  return { order };
};

export default OrderDetail;
