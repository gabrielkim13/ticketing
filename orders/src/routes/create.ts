import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';

import { BadRequestError, currentUser, OrderStatus, requireAuth, validateRequest } from '@gabrielkim13-ticketing/common';

import { natsWrapper } from '../nats-wrapper';

import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();

router.post('/api/orders', currentUser, requireAuth, [
  body('ticketId')
    .not().isEmpty().withMessage('Ticket ID must be provided')
    .custom((value: string) => mongoose.isValidObjectId(value)).withMessage('Invalid ticket ID'),
], validateRequest, async (req: Request, res: Response) => {
  const { ticketId } = req.body;

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) return res.status(404).send();

  if (await ticket.isReserved()) throw new BadRequestError('Ticket is already reserved');

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + 15 * 60);

  const order = Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.Created,
    expiresAt,
    ticket
  });

  await order.save();

  new OrderCreatedPublisher(natsWrapper.client).publish({
    id: order.id,
    userId: order.userId,
    status: order.status,
    expiresAt: order.expiresAt.toISOString(),
    version: order.version,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  });

  res.status(201).send(order);
});

export { router as createRouter };
