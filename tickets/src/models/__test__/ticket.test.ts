import { Ticket } from '../ticket';

describe('Ticket', () => {
  it('should implement OCC', async (done) => {
    const ticket = Ticket.build({
      price: 1,
      title: 'Title',
      userId: 'User ID'
    });

    await ticket.save();

    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    firstInstance!.set({ title: 'Title 1' });
    secondInstance!.set({ title: 'Title 2' });

    await firstInstance!.save();

    try {
      await secondInstance!.save();
    } catch (err) {
      return done();
    }

    throw new Error('OCC failed');
  });

  it('should increment the version number on each save', async () => {
    const ticket = Ticket.build({
      price: 1,
      title: 'Title',
      userId: 'User ID'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);
  })
});
