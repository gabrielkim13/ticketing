import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import mongoose from 'mongoose';

import { UnauthorizedError, currentUser, requireAuth, validateRequest, OrderStatus } from '@gabrielkim13-ticketing/common';

import { natsWrapper } from '../nats-wrapper';

import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';

const router = express.Router();

router.delete('/api/orders/:id', currentUser, requireAuth, [
  param('id')
    .custom((value: string) => mongoose.isValidObjectId(value)).withMessage('Order ID is invalid'),
], validateRequest, async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate('ticket');

  if (!order) return res.status(404).send();

  if (order.userId !== req.currentUser!.id) throw new UnauthorizedError();

  order.status = OrderStatus.Cancelled;

  await order.save();

  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    ticket: {
      id: order.ticket.id,
    },
  });

  res.send(order);
});

export { router as deleteRouter };
