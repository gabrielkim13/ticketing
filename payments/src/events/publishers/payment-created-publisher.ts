import { Publisher, Subjects, PaymentCreatedEvent } from '@gabrielkim13-ticketing/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
