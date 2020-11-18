import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { isValidObjectId } from 'mongoose';

import { BadRequestError, UnauthorizedError, currentUser, requireAuth, validateRequest } from '@gabrielkim13-ticketing/common';

import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';

import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', currentUser, requireAuth, [
  body('title')
    .not().isEmpty().withMessage('Title must no be empty'),
  body('price')
    .isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
], validateRequest, async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new BadRequestError('Ticket id is invalid');

  const ticket = await Ticket.findById(id);

  if (!ticket) return res.status(404).send();

  if (ticket.userId !== req.currentUser!.id) throw new UnauthorizedError('This ticket does not belong to you');

  if (ticket.orderId) throw new BadRequestError('This ticket is already reserved');

  const { title, price } = req.body;

  ticket.title = title;
  ticket.price = price;

  await ticket.save();

  new TicketUpdatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId,
    version: ticket.version,
  });

  res.send(ticket);
});

export { router as updateRouter };
