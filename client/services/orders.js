import axios from 'axios';

const ordersService = (headers = null) => {
  const baseURL = typeof window === 'undefined'
    ? 'http://ticketing-orders-srv:3000/api/orders'
    : '/api/orders';

  const api = axios.create({
    baseURL,
    headers
  });

  return {
    async create({ ticketId }) {
      const response = await api.post('/', {
        ticketId,
      });

      const order = response.data;

      return order;
    },

    async index() {
      const response = await api.get('/');

      const orders = response.data;

      return orders;
    },

    async show(id) {
      const response = await api.get(`/${id}`);

      const order = response.data;

      return order;
    },
  }
}

export default ordersService;
