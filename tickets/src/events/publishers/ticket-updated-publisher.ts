import { Publisher, Subjects, TicketUpdatedEvent } from '@gabrielkim13-ticketing/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
