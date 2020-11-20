import axios from 'axios';

const ticketsService = (headers = null) => {
  const baseURL = typeof window === 'undefined'
    ? 'http://ticketing-tickets-srv:3000/api/tickets'
    : '/api/tickets';

  const api = axios.create({
    baseURL,
    headers
  });

  return {
    async create({ title, price }) {
      const response = await api.post('/', {
        title,
        price,
      });

      const ticket = response.data;

      return ticket;
    },

    async index() {
      const response = await api.get('/');

      const tickets = response.data;

      return tickets;
    },

    async show(id) {
      const response = await api.get(`/${id}`);

      const ticket = response.data;

      return ticket;
    },
  }
}

export default ticketsService;
