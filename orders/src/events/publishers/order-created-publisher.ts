import { Publisher, Subjects, OrderCreatedEvent } from '@gabrielkim13-ticketing/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
