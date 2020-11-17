import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import mongoose from 'mongoose';

import { UnauthorizedError, currentUser, requireAuth, validateRequest } from '@gabrielkim13-ticketing/common';

import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/:id', currentUser, requireAuth, [
  param('id')
    .custom((value: string) => mongoose.isValidObjectId(value)).withMessage('Order ID is invalid'),
], validateRequest, async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate('ticket');

  if (!order) return res.status(404).send();

  if (order.userId !== req.currentUser!.id) throw new UnauthorizedError();

  res.send(order);
});

export { router as showRouter };
