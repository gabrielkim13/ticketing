import React from 'react';

import ordersService from '../../services/orders';

const OrderIndex = ({ orders }) => {
  return (
    <div>
      <h1>Orders</h1>

      {
        orders && orders.length > 0 &&
        <ul>
          {
            orders.map(({ id, status, ticket }) => (
              <li key={id}>{ticket.title} - {status}</li>
            ))
          }
        </ul>
      }
    </div>
  );
};

OrderIndex.getInitialProps = async (ctx) => {
  const orders = await ordersService(ctx.req?.headers).index();

  return { orders };
};

export default OrderIndex;
