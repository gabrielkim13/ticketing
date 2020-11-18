import { Ticket } from '../ticket';

describe('Ticket', () => {
  it('should implement OCC', async () => {
    const ticket = Ticket.build({
      id: 'Id',
      title: 'Title',
      price: 1,
    });
  });
});
