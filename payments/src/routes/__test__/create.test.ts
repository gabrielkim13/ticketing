import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { stripe } from '../../stripe';
import { signup } from '../../test/auth-helper';
import { Order, OrderStatus } from '../../models/order';
import { Payment } from '../../models/payment';

describe('Create', () => {
  it('should not be accessible by non-authenticated users', async () => {
    const response = await request(app)
      .post('/api/payments')
      .send({});

    expect(response.status).toEqual(401);
  });

  it('should be accessible by authenticated users', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', cookiesHeader)
      .send({});

    expect(response.status).not.toEqual(401);
  });

  it('should return an error if no token is provided', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', cookiesHeader)
      .send({
        token: '',
        orderId: mongoose.Types.ObjectId().toHexString(),
      });

    expect(response.status).toEqual(400);
  });

  it('should return an error if an invalid order ID is provided', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', cookiesHeader)
      .send({
        token: 'token',
        orderId: 'invalid-id',
      });

    expect(response.status).toEqual(400);
  });

  it('should return an error if the order does not exist', async () => {
    const cookiesHeader = await signup();

    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', cookiesHeader)
      .send({
        token: 'token',
        orderId: mongoose.Types.ObjectId().toHexString(),
      });

    expect(response.status).toEqual(404);
  });

  it('should return a 401 error if the order does not belong to the user', async () => {
    const cookiesHeader = await signup('id1');

    const order = Order.build({
      id: mongoose.Types.ObjectId().toHexString(),
      userId: 'id2',
      status: OrderStatus.Created,
      price: 1,
    });

    await order.save();

    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', cookiesHeader)
      .send({
        token: 'token',
        orderId: order.id,
      });

    expect(response.status).toEqual(401);
  });

  it('should return a 400 error if the order has already been cancelled', async () => {
    const cookiesHeader = await signup('id');

    const order = Order.build({
      id: mongoose.Types.ObjectId().toHexString(),
      userId: 'id',
      status: OrderStatus.Cancelled,
      price: 1,
    });

    await order.save();

    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', cookiesHeader)
      .send({
        token: 'token',
        orderId: order.id,
      });

    expect(response.status).toEqual(400);
  });

  it('should return a 201 status with valid inputs', async () => {
    const cookiesHeader = await signup('id');

    const order = Order.build({
      id: mongoose.Types.ObjectId().toHexString(),
      userId: 'id',
      status: OrderStatus.Created,
      price: 1,
    });

    await order.save();

    const response = await request(app)
      .post('/api/payments')
      .set('Cookie', cookiesHeader)
      .send({
        token: 'token',
        orderId: order.id,
      });

    const payment = await Payment.findOne({ orderId: order.id });

    expect(response.status).toEqual(201);
    expect(stripe.charges.create).toHaveBeenCalledWith({
      source: 'token',
      currency: 'usd',
      amount: order.price * 100,
    });
    expect(payment).not.toBeNull();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
