import React from 'react';
import Link from 'next/link';

import ticketsService from '../services/tickets';

const Home = ({ user, tickets }) => {
  return (
    <div>
      <h1>Tickets available</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>

        <tbody>
          {tickets && tickets.length > 0 && tickets.map(({ id, title, price }) => (
            <tr key={id}>
              <td>{title}</td>
              <td>{price}</td>
              <td>
                <Link href="/tickets/[ticketId]" as={`/tickets/${id}`}>
                  <a>View</a>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Home.getInitialProps = async (ctx) => {
  const tickets = await ticketsService(ctx.req?.headers).index();

  return { tickets };
};

export default Home;
