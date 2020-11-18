import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { Order, OrderStatus } from './order';

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

interface TicketDocument extends mongoose.Document, Omit<TicketAttrs, 'id'> {
  isReserved(): boolean;
  version: number;
}

interface TicketModel extends mongoose.Model<TicketDocument> {
  build(attrs: TicketAttrs): TicketDocument;
  findByEvent(event: { id: string, version: number }): Promise<TicketDocument | null>;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
    versionKey: false,
  }
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  const { id, ...rest } = attrs;

  return new Ticket({
    _id: id,
    ...rest,
  });
};

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  const { id, version } = event;

  return Ticket.findOne({ _id: id, version: version - 1 });
};

ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ]
    }
  });

  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDocument, TicketModel>('Ticket', ticketSchema);

export { Ticket, TicketDocument };
