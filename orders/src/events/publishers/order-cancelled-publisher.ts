import { Publisher, Subjects, OrderCancelledEvent } from '@gabrielkim13-ticketing/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
