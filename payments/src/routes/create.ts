import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';

import { BadRequestError, currentUser, OrderStatus, requireAuth, UnauthorizedError, validateRequest } from '@gabrielkim13-ticketing/common';

import { stripe } from '../stripe';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments', currentUser, requireAuth, [
  body('token')
    .not().isEmpty().withMessage('Token must no be empty'),
  body('orderId')
    .custom((value: string) => mongoose.isValidObjectId(value)).withMessage('Order ID is invalid'),
], validateRequest, async (req: Request, res: Response) => {
  const { token, orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) return res.status(404).send();

  if (order.userId !== req.currentUser!.id) throw new UnauthorizedError('This order does not belong to you');

  if (order.status === OrderStatus.Cancelled) throw new BadRequestError('This order has already been cancelled');

  const response = await stripe.charges.create({
    source: token,
    currency: 'usd',
    amount: order.price * 100,
  });

  const payment = Payment.build({
    orderId,
    stripeId: response.id,
  });

  await payment.save();

  await new PaymentCreatedPublisher(natsWrapper.client).publish({
    id: payment.id,
    orderId: payment.orderId,
    stripeId: payment.stripeId,
  });

  res.status(201).send(payment);
});

export { router as createRouter };
