import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { OrderStatus } from '@gabrielkim13-ticketing/common';

interface OrderAttrs {
  id: string;
  userId: string;
  status: OrderStatus;
  price: number;
}

interface OrderDocument extends mongoose.Document, Omit<OrderAttrs, 'id'> {
  version: number;
}

interface OrderModel extends mongoose.Model<OrderDocument> {
  build(attrs: OrderAttrs): OrderDocument;
  findByEvent(event: { id: string, version: number }): OrderDocument;
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
  },
  price: {
    type: Number,
    required: true,
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
    versionKey: false,
  }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  const { id, ...rest } = attrs;

  return new Order({
    _id: id,
    ...rest,
  });
};

orderSchema.statics.findByEvent = async (event: { id: string, version: number }) => {
  const { id, version } = event;

  return await Order.findOne({ _id: id, version: version - 1 });
};

const Order = mongoose.model<OrderDocument, OrderModel>('Order', orderSchema);

export { Order, OrderStatus, OrderDocument };
