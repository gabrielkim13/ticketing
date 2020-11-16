import { Publisher, Subjects, TicketCreatedEvent } from '@gabrielkim13-ticketing/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
